"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { createProduct, reorderProducts } from "@/actions/admin/products";

interface ProductsManagerProps {
  categories: any[];
  initialProducts: any[];
}

export default function ProductsManager({ categories, initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || "");
  const [isPending, startTransition] = useTransition();

  // Create Form states
  const [prodId, setProdId] = useState("");
  const [menuCode, setMenuCode] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [dairyMilk, setDairyMilk] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "out_of_stock">("available");
  const [launchDate, setLaunchDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);

  // Filter products by selected category
  const filteredProducts = products.filter((p) => p.category_id === selectedCatId);

  // Sync products state if props change
  const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);
  if (initialProducts !== prevInitialProducts) {
    setPrevInitialProducts(initialProducts);
    setProducts(initialProducts);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setMessage(null);

    const payload = {
      id: prodId,
      category_id: selectedCatId,
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
      const res = await createProduct(payload);
      if (res.success) {
        setMessage("Product created successfully! Setup variants next.");
        setProdId("");
        setMenuCode("");
        setNameEn("");
        setNameAr("");
        setDairyMilk("");
        setLaunchDate("");
        setEndDate("");
        
        // Add to local state list
        setProducts([...products, res.data]);
      } else {
        setFormError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const list = [...filteredProducts];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap elements in category-specific list
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Merge back into main list
    const otherProducts = products.filter((p) => p.category_id !== selectedCatId);
    const reorderedList = [...otherProducts, ...list];
    setProducts(reorderedList);

    startTransition(async () => {
      const productIds = list.map((p) => p.id);
      const res = await reorderProducts(selectedCatId, productIds);
      if (res.success) {
        setMessage("Product hierarchy order saved!");
      } else {
        setFormError(res.error);
      }
    });
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-condensed text-[32px] font-black uppercase tracking-wider">
          Manage Products
        </h1>
        <p className="font-condensed text-[12px] text-white/40 tracking-widest uppercase">
          Create, filter and edit beverage products catalog
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-condensed tracking-wider uppercase">
          {message}
        </div>
      )}

      {formError && (
        <div className="p-3 bg-crimson/10 border border-crimson/25 text-crimson text-[11px] font-condensed tracking-wider uppercase">
          {formError}
        </div>
      )}

      {/* Category selector filters */}
      <div className="flex flex-wrap gap-3 font-condensed text-[10px] tracking-widest uppercase">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCatId(cat.id);
              setMessage(null);
              setFormError(null);
            }}
            className={`px-3 py-2 border transition-all duration-300 cursor-pointer ${
              selectedCatId === cat.id
                ? "bg-crimson border-crimson text-white font-bold"
                : "border-white/10 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {cat.display_name || cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Products List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-charcoal/10 border border-white/5 p-6">
            <h2 className="font-condensed text-[14px] font-bold uppercase tracking-widest text-white/60 mb-6">
              Products in Section
            </h2>

            {filteredProducts.length === 0 ? (
              <div className="py-6 text-center font-condensed text-[11px] text-white/30 uppercase tracking-widest">
                No products found in this category.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((prod, idx) => (
                  <div
                    key={prod.id}
                    className="border border-white/5 bg-charcoal/5 p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
                  >
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-condensed text-[10px] text-crimson font-bold">
                          {prod.menu_code ? prod.menu_code.padStart(2, "0") : "00"}
                        </span>
                        <span className="font-condensed text-[14px] font-bold uppercase tracking-wider text-white">
                          {prod.name}
                        </span>
                        <span className="font-arabic text-[12px] text-crimson">
                          {prod.arabic_name}
                        </span>
                        {!prod.is_active && (
                          <span className="px-1.5 py-0.5 bg-crimson/15 border border-crimson/30 text-crimson text-[7px] font-condensed tracking-widest uppercase rounded">
                            INACTIVE
                          </span>
                        )}
                        {prod.availability_status === "out_of_stock" && (
                          <span className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[7px] font-condensed tracking-widest uppercase rounded">
                            OUT OF STOCK
                          </span>
                        )}
                      </div>
                      <p className="font-condensed text-[9px] text-white/40 tracking-wider mt-1 uppercase">
                        ID: {prod.id} {prod.dairy_milk ? `— Milk: ${prod.dairy_milk}` : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 font-condensed text-[9px] tracking-widest">
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0 || isPending}
                        className="p-1.5 border border-white/5 bg-black hover:border-white/20 disabled:opacity-30 cursor-pointer"
                      >
                        ▲ UP
                      </button>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === filteredProducts.length - 1 || isPending}
                        className="p-1.5 border border-white/5 bg-black hover:border-white/20 disabled:opacity-30 cursor-pointer"
                      >
                        ▼ DOWN
                      </button>
                      <Link
                        href={`/admin/products/${prod.id}`}
                        className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 uppercase"
                      >
                        EDIT DETAILS
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Creation Panel */}
        <div className="bg-charcoal/10 border border-white/5 p-6 h-fit">
          <h2 className="font-condensed text-[14px] font-bold uppercase tracking-widest text-white/60 mb-6">
            Create Product
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Product Slug (ID)</label>
              <input
                value={prodId}
                onChange={(e) => setProdId(e.target.value.toLowerCase())}
                required
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-condensed"
                placeholder="matcha-latte"
              />
              {fieldErrors.id && <span className="text-crimson text-[9px] font-condensed">{fieldErrors.id[0]}</span>}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Menu Code Number</label>
              <input
                value={menuCode}
                onChange={(e) => setMenuCode(e.target.value)}
                required
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-condensed"
                placeholder="03"
              />
              {fieldErrors.menu_code && <span className="text-crimson text-[9px] font-condensed">{fieldErrors.menu_code[0]}</span>}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Name (English)</label>
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-condensed"
                placeholder="Matcha Latte"
              />
              {fieldErrors.name_en && <span className="text-crimson text-[9px] font-condensed">{fieldErrors.name_en[0]}</span>}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Name (Arabic)</label>
              <input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                required
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-arabic"
                placeholder="ماتشا لاتيه"
                dir="rtl"
              />
              {fieldErrors.name_ar && <span className="text-crimson text-[9px] font-condensed">{fieldErrors.name_ar[0]}</span>}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Dairy/Milk Options</label>
              <input
                value={dairyMilk}
                onChange={(e) => setDairyMilk(e.target.value)}
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-condensed"
                placeholder="Oat Milk / Soy Milk available"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Launch Date</label>
                <input
                  type="date"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="bg-black border border-white/10 p-2 text-[11px] text-white focus:outline-none focus:border-crimson font-condensed"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-black border border-white/10 p-2 text-[11px] text-white focus:outline-none focus:border-crimson font-condensed"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  id="create-active-prod"
                  className="accent-crimson"
                />
                <label htmlFor="create-active-prod" className="font-condensed text-[10px] uppercase tracking-wider">Active</label>
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
              {isPending ? "Creating..." : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
