"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/actions/admin/products";
import { createVariant, updateVariant, reorderVariants } from "@/actions/admin/variants";
import { uploadProductImage, removeProductImage } from "@/actions/admin/assets";

interface ProductEditorProps {
  product: any;
  categories: any[];
  initialVariants: any[];
  initialAssets: any[];
}

export default function ProductEditor({
  product,
  categories,
  initialVariants,
  initialAssets,
}: ProductEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // SECTION 1: DETAILS STATES
  const [menuCode, setMenuCode] = useState(product.menu_code || "");
  const [nameEn, setNameEn] = useState(product.name || "");
  const [nameAr, setNameAr] = useState(product.arabic_name || "");
  const [categoryId, setCategoryId] = useState(product.category_id || "");
  const [dairyMilk, setDairyMilk] = useState(product.dairy_milk || "");
  const [availabilityStatus, setAvailabilityStatus] = useState(product.availability_status || "available");
  const [isActive, setIsActive] = useState(product.is_active !== false);
  const [launchDate, setLaunchDate] = useState(
    product.launch_date ? new Date(product.launch_date).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    product.end_date ? new Date(product.end_date).toISOString().split("T")[0] : ""
  );

  const [detailsMsg, setDetailsMsg] = useState<string | null>(null);
  const [detailsErr, setDetailsErr] = useState<string | null>(null);

  // SECTION 2: VARIANTS STATES
  const [variants, setVariants] = useState(initialVariants);
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCalories, setNewCalories] = useState("");
  const [newCalNote, setNewCalNote] = useState("");
  const [newOz, setNewOz] = useState("");
  const [variantMsg, setVariantMsg] = useState<string | null>(null);
  const [variantErr, setVariantErr] = useState<string | null>(null);

  // Active inline editing index
  const [editingVarId, setEditingVarId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const [editCalNote, setEditCalNote] = useState("");
  const [editOz, setEditOz] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // SECTION 3: ASSETS STATES
  const [assets, setAssets] = useState(initialAssets);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  // 1. SAVE PRODUCT DETAILS
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsMsg(null);
    setDetailsErr(null);

    const payload = {
      category_id: categoryId,
      menu_code: menuCode,
      name_en: nameEn,
      name_ar: nameAr,
      dairy_milk: dairyMilk || null,
      availability_status: availabilityStatus,
      launch_date: launchDate || null,
      end_date: endDate || null,
      is_active: isActive,
    };

    startTransition(async () => {
      setDetailsMsg("Saving details...");
      const res = await updateProduct(product.id, payload);
      if (res.success) {
        setDetailsMsg("Product details saved successfully!");
      } else {
        setDetailsMsg(null);
        setDetailsErr(res.error);
      }
    });
  };

  // 2. CREATE NEW VARIANT SIZE
  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setVariantMsg(null);
    setVariantErr(null);

    // Calculate a size code, e.g. "16 OZ" -> "16oz"
    const sizeCode = newLabel.toLowerCase().replace(/\s+/g, "");

    const payload = {
      product_id: product.id,
      size_label: newLabel,
      size_code: sizeCode,
      price: Number(newPrice),
      calories: newCalories ? Number(newCalories) : null,
      calorie_note: newCalNote || null,
      oz: newOz ? Number(newOz) : null,
      is_active: true,
    };

    startTransition(async () => {
      setVariantMsg("Creating size variant...");
      const res = await createVariant(payload);
      if (res.success) {
        setVariantMsg("Size variant created successfully!");
        setNewLabel("");
        setNewPrice("");
        setNewCalories("");
        setNewCalNote("");
        setNewOz("");
        setVariants([...variants, res.data]);
      } else {
        setVariantMsg(null);
        setVariantErr(res.error);
      }
    });
  };

  // 3. EDIT EXISTING VARIANT
  const handleStartEditVariant = (v: any) => {
    setEditingVarId(v.id);
    setEditLabel(v.size_label);
    setEditPrice(v.price.toString());
    setEditCalories(v.calories !== null ? v.calories.toString() : "");
    setEditCalNote(v.calorie_note || "");
    setEditOz(v.oz !== null ? v.oz.toString() : "");
    setEditIsActive(v.is_active);
    setVariantMsg(null);
    setVariantErr(null);
  };

  const handleSaveVariant = async (varId: string) => {
    setVariantMsg(null);
    setVariantErr(null);

    const payload = {
      size_label: editLabel,
      price: Number(editPrice),
      calories: editCalories ? Number(editCalories) : null,
      calorie_note: editCalNote || null,
      oz: editOz ? Number(editOz) : null,
      is_active: editIsActive,
    };

    startTransition(async () => {
      setVariantMsg("Saving variant...");
      const res = await updateVariant(varId, payload);
      if (res.success) {
        setVariantMsg("Size variant saved successfully!");
        setEditingVarId(null);
        setVariants(variants.map((v) => (v.id === varId ? { ...v, ...res.data } : v)));
      } else {
        setVariantMsg(null);
        setVariantErr(res.error);
      }
    });
  };

  const handleMoveVariant = async (index: number, direction: "up" | "down") => {
    const list = [...variants];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setVariants(list);

    startTransition(async () => {
      setVariantMsg("Saving variant order...");
      const ids = list.map((v) => v.id);
      const res = await reorderVariants(product.id, ids);
      if (res.success) {
        setVariantMsg("Variant order saved successfully!");
      } else {
        setVariantMsg(null);
        setVariantErr(res.error);
      }
    });
  };

  // 4. IMAGE UPLOAD & REMOVALS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    setUploadMsg(null);
    setUploadErr(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    startTransition(async () => {
      setUploadMsg("Uploading image to storage...");
      const res = await uploadProductImage(product.id, null, formData);
      if (res.success) {
        setUploadMsg("Product image uploaded successfully!");
        setSelectedFile(null);
        setAssets([res.data]);
        router.refresh();
      } else {
        setUploadMsg(null);
        setUploadErr(res.error);
      }
    });
  };

  const handleRemoveImage = async () => {
    setUploadMsg(null);
    setUploadErr(null);

    startTransition(async () => {
      setUploadMsg("Deleting image...");
      const res = await removeProductImage(product.id, null);
      if (res.success) {
        setUploadMsg("Product image deleted successfully!");
        setAssets([]);
        router.refresh();
      } else {
        setUploadMsg(null);
        setUploadErr(res.error);
      }
    });
  };

  // Find default image URL (if it exists in state list)
  const defaultAsset = assets.find((a) => !a.variant_id);

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="font-condensed text-[32px] font-black uppercase tracking-wider">
            Edit: {product.name}
          </h1>
          <p className="font-condensed text-[12px] text-white/40 tracking-widest uppercase">
            Beverage Details, sizes variants, and cutouts uploader
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 md:mt-0 font-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/10 px-4 py-2 cursor-pointer"
        >
          [ ← BACK TO CATALOG ]
        </button>
      </div>

      {/* Grid segments: 1. details, 2. sizes/assets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Product details form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-charcoal/10 border border-white/5 p-6 space-y-6">
            <h2 className="font-condensed text-[14px] font-bold uppercase tracking-widest text-white/60">
              01 — Product Specifications
            </h2>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              {detailsMsg && (
                <div className="p-3 bg-white/5 border border-white/10 text-white/70 text-[10px] font-condensed tracking-wider uppercase">
                  {detailsMsg}
                </div>
              )}
              {detailsErr && (
                <div className="p-3 bg-crimson/10 border border-crimson/25 text-crimson text-[10px] font-condensed tracking-wider uppercase">
                  {detailsErr}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Menu Code</label>
                  <input
                    value={menuCode}
                    onChange={(e) => setMenuCode(e.target.value)}
                    required
                    className="bg-black border border-white/10 p-2.5 text-[12px] focus:outline-none focus:border-crimson font-condensed"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Category Assignment</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="bg-black border border-white/10 p-2.5 text-[12px] focus:outline-none focus:border-crimson font-condensed"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.display_name || cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Name (English)</label>
                  <input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    required
                    className="bg-black border border-white/10 p-2.5 text-[12px] focus:outline-none focus:border-crimson font-condensed"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Name (Arabic)</label>
                  <input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    required
                    className="bg-black border border-white/10 p-2.5 text-[12px] focus:outline-none focus:border-crimson font-arabic text-right"
                    dir="rtl"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col space-y-1.5">
                  <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Dairy/Milk Options</label>
                  <input
                    value={dairyMilk}
                    onChange={(e) => setDairyMilk(e.target.value)}
                    className="bg-black border border-white/10 p-2.5 text-[12px] focus:outline-none focus:border-crimson font-condensed"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Launch Date</label>
                  <input
                    type="date"
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    className="bg-black border border-white/10 p-2 text-[11px] focus:outline-none focus:border-crimson font-condensed"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-black border border-white/10 p-2 text-[11px] focus:outline-none focus:border-crimson font-condensed"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    id="edit-active-prod"
                    className="accent-crimson"
                  />
                  <label htmlFor="edit-active-prod" className="font-condensed text-[10px] uppercase tracking-wider">Product Active Status</label>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="font-condensed text-[10px] uppercase tracking-wider text-white/60">Availability:</label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                    className="bg-black border border-white/10 p-1 text-[10px] font-condensed"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-crimson hover:bg-red-700 text-white font-condensed text-[11px] font-bold uppercase tracking-[0.2em] p-3 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
              >
                [ Save Product Details ]
              </button>
            </form>
          </div>

          {/* SECTION 2: VARIANTS LIST & CREATOR */}
          <div className="bg-charcoal/10 border border-white/5 p-6 space-y-6">
            <h2 className="font-condensed text-[14px] font-bold uppercase tracking-widest text-white/60">
              02 — Size Variants & Grades
            </h2>

            {variantMsg && (
              <div className="p-3 bg-white/5 border border-white/10 text-white/70 text-[10px] font-condensed tracking-wider uppercase">
                {variantMsg}
              </div>
            )}
            {variantErr && (
              <div className="p-3 bg-crimson/10 border border-crimson/25 text-crimson text-[10px] font-condensed tracking-wider uppercase">
                {variantErr}
              </div>
            )}

            {/* List variants */}
            <div className="space-y-4 font-condensed tracking-wider">
              {variants.map((v, idx) => {
                const isEditingVar = editingVarId === v.id;

                return (
                  <div
                    key={v.id}
                    className="border border-white/5 bg-black/30 p-4 flex flex-col space-y-4"
                  >
                    {isEditingVar ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] uppercase text-white/40">Label</label>
                          <input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="bg-black border border-white/10 p-1.5 text-[11px] focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] uppercase text-white/40">Price (SAR)</label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="bg-black border border-white/10 p-1.5 text-[11px] focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] uppercase text-white/40">Calories</label>
                          <input
                            type="number"
                            value={editCalories}
                            onChange={(e) => setEditCalories(e.target.value)}
                            className="bg-black border border-white/10 p-1.5 text-[11px] focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] uppercase text-white/40">Oz</label>
                          <input
                            type="number"
                            value={editOz}
                            onChange={(e) => setEditOz(e.target.value)}
                            className="bg-black border border-white/10 p-1.5 text-[11px] focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <div className="col-span-2 flex flex-col space-y-1">
                          <label className="text-[8px] uppercase text-white/40">Calorie Note</label>
                          <input
                            value={editCalNote}
                            onChange={(e) => setEditCalNote(e.target.value)}
                            className="bg-black border border-white/10 p-1.5 text-[11px] focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between pt-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editIsActive}
                              onChange={(e) => setEditIsActive(e.target.checked)}
                              id={`active-v-${v.id}`}
                            />
                            <label htmlFor={`active-v-${v.id}`} className="text-[9px] uppercase tracking-widest">Active</label>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingVarId(null)}
                              className="px-2.5 py-1 border border-white/10 text-[9px] uppercase hover:bg-white/5 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveVariant(v.id)}
                              className="px-2.5 py-1 bg-crimson text-[9px] uppercase hover:bg-red-700 cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="text-[12px] font-bold text-white uppercase">{v.size_label}</span>
                            <span className="text-[12px] font-bold text-crimson">{v.price} SAR</span>
                            {!v.is_active && (
                              <span className="px-1.5 py-0.5 bg-crimson/15 border border-crimson/30 text-crimson text-[7px] font-condensed tracking-widest uppercase rounded">
                                INACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">
                            {v.calories !== null ? `${v.calories} KCAL` : "NO CALORIES"} {v.calorie_note ? `(${v.calorie_note})` : ""} {v.oz ? `— ${v.oz} OZ` : ""}
                          </p>
                        </div>

                        {/* Order controllers */}
                        <div className="flex items-center space-x-2 text-[9px] tracking-widest">
                          <button
                            onClick={() => handleMoveVariant(idx, "up")}
                            disabled={idx === 0 || isPending}
                            className="p-1 border border-white/5 bg-black hover:border-white/20 disabled:opacity-30 cursor-pointer"
                          >
                            ▲ UP
                          </button>
                          <button
                            onClick={() => handleMoveVariant(idx, "down")}
                            disabled={idx === variants.length - 1 || isPending}
                            className="p-1 border border-white/5 bg-black hover:border-white/20 disabled:opacity-30 cursor-pointer"
                          >
                            ▼ DOWN
                          </button>
                          <button
                            onClick={() => handleStartEditVariant(v)}
                            className="p-1 border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer"
                          >
                            EDIT
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form to create size */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h3 className="font-condensed text-[12px] font-bold uppercase tracking-widest text-white/50">
                Add Size Variant
              </h3>
              <form onSubmit={handleCreateVariant} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[8px] uppercase text-white/40">Label</label>
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    required
                    className="bg-black border border-white/10 p-2 text-[11px] focus:outline-none focus:border-crimson"
                    placeholder="16 OZ"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[8px] uppercase text-white/40">Price (SAR)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                    className="bg-black border border-white/10 p-2 text-[11px] focus:outline-none focus:border-crimson"
                    placeholder="12"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[8px] uppercase text-white/40">Calories</label>
                  <input
                    type="number"
                    value={newCalories}
                    onChange={(e) => setNewCalories(e.target.value)}
                    className="bg-black border border-white/10 p-2 text-[11px] focus:outline-none focus:border-crimson"
                    placeholder="120"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[8px] uppercase text-white/40">Oz</label>
                  <input
                    type="number"
                    value={newOz}
                    onChange={(e) => setNewOz(e.target.value)}
                    className="bg-black border border-white/10 p-2 text-[11px] focus:outline-none focus:border-crimson"
                    placeholder="16"
                  />
                </div>
                <div className="col-span-2 flex flex-col space-y-1">
                  <label className="text-[8px] uppercase text-white/40">Calorie Note</label>
                  <input
                    value={newCalNote}
                    onChange={(e) => setNewCalNote(e.target.value)}
                    className="bg-black border border-white/10 p-2 text-[11px] focus:outline-none focus:border-crimson"
                    placeholder="Zero Cal"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-white/5 border border-white/10 text-white font-condensed text-[10px] font-bold uppercase tracking-widest p-2.5 hover:bg-white/10 cursor-pointer"
                  >
                    + Add Size Variant
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Assets Image uploader */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-charcoal/10 border border-white/5 p-6 space-y-6">
            <h2 className="font-condensed text-[14px] font-bold uppercase tracking-widest text-white/60">
              03 — Brand Image Asset
            </h2>

            {uploadMsg && (
              <div className="p-3 bg-white/5 border border-white/10 text-white/70 text-[10px] font-condensed tracking-wider uppercase">
                {uploadMsg}
              </div>
            )}
            {uploadErr && (
              <div className="p-3 bg-crimson/10 border border-crimson/25 text-crimson text-[10px] font-condensed tracking-wider uppercase">
                {uploadErr}
              </div>
            )}

            {/* Current asset display */}
            {defaultAsset ? (
              <div className="space-y-4">
                <div className="relative border border-white/5 bg-black p-4 flex items-center justify-center h-48 select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={defaultAsset.storage_path.startsWith("http") ? defaultAsset.storage_path : `/assets/products/${product.id}.png`}
                    alt={product.name}
                    className="h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                  />
                </div>
                <div className="text-[10px] font-condensed tracking-widest text-white/40 uppercase break-all">
                  Path: {defaultAsset.storage_path}
                </div>
                <button
                  onClick={handleRemoveImage}
                  disabled={isPending}
                  className="w-full border border-crimson/20 text-crimson hover:bg-crimson/10 font-condensed text-[10px] font-bold uppercase tracking-[0.2em] p-2.5 transition-colors duration-300 cursor-pointer"
                >
                  Delete Image Object
                </button>
              </div>
            ) : (
              <div className="border border-white/5 border-dashed bg-black/10 p-6 text-center space-y-4 select-none">
                <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mx-auto">
                  <span className="text-[14px] text-white/35">🖼️</span>
                </div>
                <p className="font-condensed text-[10px] tracking-widest uppercase text-white/40 max-w-[200px] mx-auto leading-normal">
                  No default asset configured for this product cutout.
                </p>
              </div>
            )}

            {/* Uploader inputs */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h3 className="font-condensed text-[12px] font-bold uppercase tracking-widest text-white/50">
                Upload cutouts file
              </h3>
              <div className="flex flex-col space-y-3 font-condensed text-[10px] tracking-widest uppercase">
                <input
                  type="file"
                  accept="image/png, image/webp, image/avif, image/jpeg"
                  onChange={handleFileChange}
                  className="text-[11px] text-white/60 cursor-pointer file:bg-white/5 file:border-white/10 file:p-2 file:text-[10px] file:text-white file:uppercase file:tracking-widest file:hover:bg-white/10 file:cursor-pointer"
                />
                <p className="text-[8px] text-white/30 lowercase normal-case tracking-normal">
                  Supported formats: transparent PNG, WebP, AVIF, JPEG. Maximum size: 10MB.
                </p>
                <button
                  onClick={handleUploadImage}
                  disabled={!selectedFile || isPending}
                  className="w-full bg-crimson hover:bg-red-700 text-white font-condensed text-[11px] font-bold uppercase tracking-[0.2em] p-2.5 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Uploading..." : "Upload / Replace Image"}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
