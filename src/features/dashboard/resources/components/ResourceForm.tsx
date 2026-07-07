"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import {
  getCategories,
  createCategory,
  createResource,
  updateResource,
} from "../actions/resourcesAction";
import { Category, Resource, CreateResourceInput } from "@/types/resourceType";

export interface ResourceFormProps {
  resource?: Resource | null; // If passed, we are in Edit mode
  onSaveSuccess: (message: string) => void;
  onCancel: () => void;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  resource = null,
  onSaveSuccess,
  onCancel,
}) => {
  const isEditMode = !!resource;

  // Form Fields State
  const [title, setTitle] = useState(resource?.title || "");
  const [url, setUrl] = useState(resource?.url || "");
  const [categoryId, setCategoryId] = useState(resource?.category_id || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [favorite, setFavorite] = useState(resource?.favorite || false);

  // Loading & Error States
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Inline Category States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Load Categories on mount
  useEffect(() => {
    async function loadCats() {
      setIsFetchingCategories(true);
      const res = await getCategories();
      if (res.error) {
        setErrorMessage(`Failed to load categories: ${res.error}`);
      } else {
        setCategories(res.categories);
        // Default to first category if none is set
        if (!categoryId && res.categories.length > 0) {
          setCategoryId(res.categories[0].id);
          console.log("*************************************Default CategoryId: ");
          console.log(categoryId);
        }
      }
      setIsFetchingCategories(false);
    }
    loadCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update states if resource prop changes
  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setUrl(resource.url);
      setCategoryId(resource.category_id);
      setDescription(resource.description || "");
      setFavorite(resource.favorite || false);
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    setFieldErrors({});

    const formData: CreateResourceInput = {
      title,
      url,
      category_id: categoryId,
      description: description || null,
      favorite,
    };
    console.log("***********************")
    console.log("      C      ")
    console.log(formData)
    console.log("            ")
    console.log("***********************")

    let result;
    if (isEditMode && resource) {
      result = await updateResource(resource.id, formData);
    } else {
      result = await createResource(formData);
    }

    if (result.error) {
      if (result.error.includes("Title") || result.error.includes("URL") || result.error.includes("category")) {
        const errors: Record<string, string> = {};
        if (result.error.toLowerCase().includes("title")) errors.title = "Title validation failed.";
        if (result.error.toLowerCase().includes("url")) errors.url = "Valid URL is required (http/https).";
        if (result.error.toLowerCase().includes("category")) errors.categoryId = "Category selection is required.";

        setFieldErrors(errors);
        setErrorMessage("Please fix the validation errors below.");
      } else {
        setErrorMessage(result.error);
      }
      setIsSaving(false);
    } else {
      setIsSaving(false);
      onSaveSuccess(isEditMode ? "Resource updated successfully!" : "Resource curated successfully!");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || isCreatingCategory) return;

    setIsCreatingCategory(true);
    setCategoryError(null);

    const result = await createCategory(newCategoryName.trim());

    if (result.error) {
      setCategoryError(result.error);
      setIsCreatingCategory(false);
    } else if (result.category) {
      const newCat = result.category;
      setCategories((prev) => [...prev, newCat].sort((a, b) => a.category.localeCompare(b.category)));
      setCategoryId(newCat.id);
      setNewCategoryName("");
      setIsAddingCategory(false);
      setIsCreatingCategory(false);
    }
  };

  return (
    <div className="font-sans w-full max-w-lg mx-auto bg-white border border-gray-100 p-6 md:p-8 rounded-default shadow-sm relative overflow-hidden">
      {/* Decorative lines for stationery notebook style */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_24px]"></div>

      <div className="relative z-10 space-y-6">
        {errorMessage && (
          <div className="bg-red-50 text-red-800 border border-red-200 text-xs p-3.5 rounded-default flex items-start gap-2 animate-fade-in">
            <Icon name="delete" size={14} className="flex-shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {isFetchingCategories ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Icon name="loader" size={24} className="animate-spin text-brand-main2" />
            <span className="text-xs text-gray-400">Loading form settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-widest text-brand-dark/50 uppercase">
                Resource Title
              </label>
              <input
                type="text"
                required
                disabled={isSaving}
                className={`w-full bg-white border rounded-default p-3 text-xs font-semibold text-brand-dark placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-main2/15 ${fieldErrors.title
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-brand-main2"
                  }`}
                placeholder="e.g. Design Systems for Curation Boards"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {fieldErrors.title && (
                <span className="text-[10px] text-red-500 font-semibold">{fieldErrors.title}</span>
              )}
            </div>

            {/* URL Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-widest text-brand-dark/50 uppercase">
                URL link
              </label>
              <input
                type="url"
                required
                disabled={isSaving}
                className={`w-full bg-white border rounded-default p-3 text-xs font-semibold text-brand-dark placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-main2/15 ${fieldErrors.url
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-brand-main2"
                  }`}
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {fieldErrors.url && (
                <span className="text-[10px] text-red-500 font-semibold">{fieldErrors.url}</span>
              )}
            </div>

            {/* Category Field with Inline Addition Toggle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold tracking-widest text-brand-dark/50 uppercase">
                  Category
                </label>
                {!isAddingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="text-[10px] font-bold text-brand-main2 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <Icon name="addIcon" size={10} className="stroke-[2.5]" />
                    <span>Create Category</span>
                  </button>
                )}
              </div>

              {/* Inline Category Creation Section */}
              {isAddingCategory ? (
                <div className="border border-[#e4d7d0]/60 bg-brand-bg/15 rounded-default p-3 space-y-2 animate-fade-in">
                  <div className="text-[10px] font-bold text-brand-dark/60">New Category Title</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 bg-white border border-gray-200 rounded-default px-3 py-1.5 text-xs font-semibold text-brand-dark focus:outline-none focus:border-brand-main2 ${categoryError ? "border-red-400" : ""
                        }`}
                      placeholder="e.g. Design Inspiration"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      onClick={handleAddCategory}
                      className="px-3.5 py-1.5 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-default text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isCreatingCategory ? (
                        <Icon name="loader" size={12} className="animate-spin" />
                      ) : (
                        <span>Add</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isCreatingCategory}
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                        setCategoryError(null);
                      }}
                      className="px-3 py-1.5 text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-default text-xs font-semibold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  {categoryError && (
                    <span className="text-[10px] text-red-500 font-semibold">{categoryError}</span>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <select
                    required
                    disabled={isSaving}
                    className={`w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-brand-main2 rounded-default p-3 pr-10 text-xs font-semibold text-brand-dark appearance-none focus:outline-none focus:ring-2 focus:ring-brand-main2/15 ${fieldErrors.categoryId ? "border-red-400" : ""
                      }`}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <Icon name="chevronDown" size={14} />
                  </span>
                </div>
              )}
              {fieldErrors.categoryId && (
                <span className="text-[10px] text-red-500 font-semibold">{fieldErrors.categoryId}</span>
              )}
            </div>

            {/* Description Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-widest text-brand-dark/50 uppercase">
                Description (Optional)
              </label>
              <textarea
                disabled={isSaving}
                rows={3.5}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-brand-main2 rounded-default p-3 text-xs font-semibold text-brand-dark placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-main2/15 resize-none"
                placeholder="Write a brief overview of the resource content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Favorite Checkbox */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <input
                type="checkbox"
                id="favorite"
                disabled={isSaving}
                className="h-4.5 w-4.5 rounded-sm border-gray-300 text-brand-main2 focus:ring-brand-main2 cursor-pointer"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              <label
                htmlFor="favorite"
                className="text-xs font-semibold text-brand-dark/70 hover:text-brand-dark cursor-pointer select-none"
              >
                Mark as Favorite
              </label>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="px-4.5 py-2.5 border border-[#e4d7d0] hover:border-gray-300 text-gray-500 hover:text-brand-dark text-xs font-semibold rounded-default transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isAddingCategory}
                className="px-5 py-2.5 bg-brand-main2 hover:bg-brand-main2/95 text-white text-xs font-semibold rounded-default shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Icon name="loader" size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Curation</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
