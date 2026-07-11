"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, reorderCategories } from "@/actions/admin/categories";
import { uploadCategoryHeroImage, removeCategoryHeroImage } from "@/actions/admin/assets";

interface CategoriesManagerProps {
  categories: any[];
}

export default function CategoriesManager({ categories: initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Create Form states
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [visibilityMode, setVisibilityMode] = useState<"standard" | "ipad">("standard");
  const [isActive, setIsActive] = useState(true);

  // Edit modal / inline states
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibilityMode, setEditVisibilityMode] = useState<"standard" | "ipad">("standard");
  const [editIsActive, setEditIsActive] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setMessage(null);

    const payload = {
      slug,
      name_en: nameEn,
      name_ar: nameAr,
      description,
      visibility_mode: visibilityMode,
      is_active: isActive,
    };

    startTransition(async () => {
      const res = await createCategory(payload);
      if (res.success) {
        setMessage("Category created successfully!");
        setSlug("");
        setNameEn("");
        setNameAr("");
        setDescription("");
        
        // Refresh local state lists
        setCategories([...categories, res.data]);
      } else {
        setFormError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  };

  const handleStartEdit = (cat: any) => {
    setEditingSlug(cat.id);
    setEditNameEn(cat.display_name || cat.name || "");
    setEditNameAr(cat.arabic_name || "");
    setEditDescription(cat.description || "");
    setEditVisibilityMode(cat.visibility_mode || cat.visibility || "standard");
    setEditIsActive(cat.is_active);
    setFormError(null);
    setFieldErrors({});
  };

  const handleSaveEdit = async (slugToSave: string) => {
    setFormError(null);
    setFieldErrors({});
    setMessage(null);

    const payload = {
      name_en: editNameEn,
      name_ar: editNameAr,
      description: editDescription,
      visibility_mode: editVisibilityMode,
      is_active: editIsActive,
    };

    startTransition(async () => {
      const res = await updateCategory(slugToSave, payload);
      if (res.success) {
        setMessage("Category updated successfully!");
        setEditingSlug(null);
        setCategories(
          categories.map((c) => (c.id === slugToSave ? { ...c, ...res.data } : c))
        );
      } else {
        setFormError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  };

  // CATEGORY HERO VISUAL UPLOADER STATES & HANDLERS
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadMsgs, setUploadMsgs] = useState<Record<string, string | null>>({});
  const [uploadErrs, setUploadErrs] = useState<Record<string, string | null>>({});

  const handleFileChange = (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles((prev) => ({ ...prev, [catId]: e.target.files![0] }));
    }
  };

  const handleUploadHero = async (catId: string) => {
    const file = selectedFiles[catId];
    if (!file) return;

    setUploadMsgs((prev) => ({ ...prev, [catId]: "Uploading hero..." }));
    setUploadErrs((prev) => ({ ...prev, [catId]: null }));

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await uploadCategoryHeroImage(catId, formData);
      if (res.success) {
        setUploadMsgs((prev) => ({ ...prev, [catId]: "Hero visual uploaded successfully!" }));
        setSelectedFiles((prev) => ({ ...prev, [catId]: null }));
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ylnpmujtjkgrpxxbtjej.supabase.co";
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/menu-products/${res.data.storage_path}`;
        setCategories((prevList) =>
          prevList.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  hero_image: publicUrl,
                  storage_path: res.data.storage_path,
                }
              : c
          )
        );
        router.refresh();
      } else {
        setUploadMsgs((prev) => ({ ...prev, [catId]: null }));
        setUploadErrs((prev) => ({ ...prev, [catId]: res.error }));
      }
    });
  };

  const handleRemoveHero = async (catId: string) => {
    setUploadMsgs((prev) => ({ ...prev, [catId]: "Removing hero..." }));
    setUploadErrs((prev) => ({ ...prev, [catId]: null }));

    startTransition(async () => {
      const res = await removeCategoryHeroImage(catId);
      if (res.success) {
        setUploadMsgs((prev) => ({ ...prev, [catId]: "Hero visual removed successfully!" }));
        setCategories((prevList) =>
          prevList.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  hero_image: null,
                  storage_path: null,
                }
              : c
          )
        );
        router.refresh();
      } else {
        setUploadMsgs((prev) => ({ ...prev, [catId]: null }));
        setUploadErrs((prev) => ({ ...prev, [catId]: res.error }));
      }
    });
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newCategories = [...categories];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newCategories.length) return;

    // Swap elements in state array
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIdx];
    newCategories[targetIdx] = temp;

    setCategories(newCategories);

    startTransition(async () => {
      const slugs = newCategories.map((c) => c.id);
      const res = await reorderCategories(slugs);
      if (res.success) {
        setMessage("Category order saved successfully!");
      } else {
        setFormError(res.error);
      }
    });
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-condensed text-[32px] font-black uppercase tracking-wider">
          Manage Categories
        </h1>
        <p className="font-condensed text-[12px] text-white/40 tracking-widest uppercase">
          Create, edit and reorder menu sections
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Categories Lists & Reorder panels */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-charcoal/10 border border-white/5 p-6">
            <h2 className="font-condensed text-[14px] font-bold uppercase tracking-widest text-white/60 mb-6">
              Active Category Hierarchy
            </h2>

            <div className="space-y-4">
              {categories.map((cat, idx) => {
                const isEditing = editingSlug === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="border border-white/5 bg-charcoal/5 p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
                  >
                    {isEditing ? (
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-condensed text-[9px] text-white/40 uppercase tracking-widest">Name (English)</label>
                          <input
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            className="bg-black border border-white/10 p-2 text-[12px] font-condensed tracking-wide focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="font-condensed text-[9px] text-white/40 uppercase tracking-widest">Name (Arabic)</label>
                          <input
                            value={editNameAr}
                            onChange={(e) => setEditNameAr(e.target.value)}
                            className="bg-black border border-white/10 p-2 text-[12px] font-arabic focus:outline-none focus:border-crimson"
                            dir="rtl"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col space-y-1.5">
                          <label className="font-condensed text-[9px] text-white/40 uppercase tracking-widest">Description</label>
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="bg-black border border-white/10 p-2 text-[12px] font-condensed tracking-wide focus:outline-none focus:border-crimson"
                          />
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editIsActive}
                              onChange={(e) => setEditIsActive(e.target.checked)}
                              id={`edit-active-${cat.id}`}
                              className="accent-crimson"
                            />
                            <label htmlFor={`edit-active-${cat.id}`} className="font-condensed text-[10px] uppercase tracking-wider">Active</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="font-condensed text-[10px] uppercase tracking-wider">Visibility:</label>
                            <select
                              value={editVisibilityMode}
                              onChange={(e) => setEditVisibilityMode(e.target.value as any)}
                              className="bg-black border border-white/10 p-1 text-[10px] font-condensed"
                            >
                              <option value="standard">Standard</option>
                              <option value="ipad">iPad Mode</option>
                            </select>
                          </div>
                        </div>

                        {/* CATEGORY HERO VISUAL SECTION */}
                        <div className="md:col-span-2 border-t border-white/5 pt-4 space-y-3">
                          <label className="font-condensed text-[10px] text-white/40 uppercase tracking-widest block font-bold">
                            Category Hero Visual
                          </label>

                          {/* Preview display */}
                          {cat.hero_image ? (
                            <div className="space-y-3">
                              <div className="relative border border-white/5 bg-black p-3 flex items-center justify-center h-36 select-none max-w-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={cat.hero_image}
                                  alt={editNameEn}
                                  className="h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                                />
                              </div>
                              <div className="text-[9px] font-condensed tracking-widest text-white/40 uppercase break-all">
                                Path: {cat.storage_path}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveHero(cat.id)}
                                disabled={isPending}
                                className="w-full max-w-sm border border-crimson/20 text-crimson hover:bg-crimson/10 font-condensed text-[9px] font-bold uppercase tracking-[0.2em] p-2 transition-colors duration-300 cursor-pointer"
                              >
                                Remove Hero Image
                              </button>
                            </div>
                          ) : (
                            <div className="text-[9px] font-condensed tracking-widest text-white/40 uppercase py-2">
                              No Hero Visual Configured
                            </div>
                          )}

                          {/* File upload inputs */}
                          <div className="flex flex-col space-y-2 max-w-sm pt-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(cat.id, e)}
                              className="text-[9px] font-condensed text-white/40 border border-white/10 p-1 bg-black focus:outline-none"
                            />
                            {selectedFiles[cat.id] && (
                              <button
                                type="button"
                                onClick={() => handleUploadHero(cat.id)}
                                disabled={isPending}
                                className="bg-crimson text-white hover:bg-red-700 font-condensed text-[9px] font-bold uppercase tracking-[0.2em] p-2 transition-colors duration-300 cursor-pointer"
                              >
                                Upload / Replace Hero
                              </button>
                            )}
                          </div>

                          {/* Status feedback messages */}
                          {uploadMsgs[cat.id] && (
                            <div className="text-[9px] font-condensed text-emerald-400 tracking-wider uppercase mt-1">
                              {uploadMsgs[cat.id]}
                            </div>
                          )}
                          {uploadErrs[cat.id] && (
                            <div className="text-[9px] font-condensed text-crimson tracking-wider uppercase mt-1">
                              {uploadErrs[cat.id]}
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-3">
                          <button
                            onClick={() => setEditingSlug(null)}
                            className="px-3 py-1.5 border border-white/10 font-condensed text-[10px] tracking-widest uppercase hover:bg-white/5 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-crimson font-condensed text-[10px] tracking-widest uppercase hover:bg-red-700 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-condensed text-[14px] font-bold uppercase tracking-wider text-white">
                              {cat.display_name || cat.name}
                            </span>
                            <span className="font-arabic text-[12px] text-crimson">
                              {cat.arabic_name}
                            </span>
                            {!cat.is_active && (
                              <span className="px-1.5 py-0.5 bg-crimson/15 border border-crimson/30 text-crimson text-[7px] font-condensed tracking-widest uppercase rounded">
                                INACTIVE
                              </span>
                            )}
                          </div>
                          <p className="font-condensed text-[10px] text-white/40 tracking-wider mt-1 uppercase max-w-md">
                            Slug: {cat.id} — Visibility: {cat.visibility_mode || cat.visibility || "standard"}
                          </p>
                        </div>

                        {/* Order controllers */}
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
                            disabled={idx === categories.length - 1 || isPending}
                            className="p-1.5 border border-white/5 bg-black hover:border-white/20 disabled:opacity-30 cursor-pointer"
                          >
                            ▼ DOWN
                          </button>
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer"
                          >
                            EDIT
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Creation Panel */}
        <div className="bg-charcoal/10 border border-white/5 p-6 h-fit">
          <h2 className="font-condensed text-[14px] font-bold uppercase tracking-widest text-white/60 mb-6">
            Create Category
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Category Slug (ID)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-condensed"
                placeholder="mojitos"
              />
              {fieldErrors.slug && <span className="text-crimson text-[9px] font-condensed">{fieldErrors.slug[0]}</span>}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Name (English)</label>
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-condensed"
                placeholder="Mojitos"
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
                placeholder="موهيتو"
                dir="rtl"
              />
              {fieldErrors.name_ar && <span className="text-crimson text-[9px] font-condensed">{fieldErrors.name_ar[0]}</span>}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="bg-black border border-white/10 p-2.5 text-[12px] text-white focus:outline-none focus:border-crimson font-condensed"
                placeholder="Refreshing mint-infused sparkling coolers"
              />
              {fieldErrors.description && <span className="text-crimson text-[9px] font-condensed">{fieldErrors.description[0]}</span>}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  id="create-active"
                  className="accent-crimson"
                />
                <label htmlFor="create-active" className="font-condensed text-[10px] uppercase tracking-wider">Active</label>
              </div>

              <div className="flex items-center space-x-2">
                <label className="font-condensed text-[10px] uppercase tracking-wider text-white/60">Visibility:</label>
                <select
                  value={visibilityMode}
                  onChange={(e) => setVisibilityMode(e.target.value as any)}
                  className="bg-black border border-white/10 p-1 text-[10px] font-condensed"
                >
                  <option value="standard">Standard</option>
                  <option value="ipad">iPad Mode</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-crimson hover:bg-red-700 text-white font-condensed text-[11px] font-bold uppercase tracking-[0.2em] p-3 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
