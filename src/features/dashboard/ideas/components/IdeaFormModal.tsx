"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import {
  getCategories,
  createCategory,
  getIdeaById,
  createIdea,
  updateIdea,
} from "../actions/ideasAction";
import { Category, CreateIdeaInput } from "@/types/ideaType";

export interface IdeaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId?: string | null; // Null/undefined means Create mode, otherwise Edit mode
  onSaveSuccess: (message: string) => void;
}

export const IdeaFormModal: React.FC<IdeaFormModalProps> = ({
  isOpen,
  onClose,
  ideaId = null,
  onSaveSuccess,
}) => {
  const isEditMode = !!ideaId;

  // Form Fields State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // System & Loading States
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Inline Category Add State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load Categories & Idea (if editing)
  useEffect(() => {
    if (!isOpen) return;

    async function loadInitialData() {
      setIsFetchingData(true);
      setErrorMessage(null);
      setFieldErrors({});

      // Fetch categories
      const catRes = await getCategories();
      if (catRes.error) {
        setErrorMessage(`Failed to load categories: ${catRes.error}`);
        setIsFetchingData(false);
        return;
      }
      setCategories(catRes.categories);

      // If Edit Mode, fetch the specific idea
      if (isEditMode && ideaId) {
        const resObj = await getIdeaById(ideaId);
        if (resObj.error) {
          setErrorMessage(`Failed to load idea: ${resObj.error}`);
        } else if (resObj.idea) {
          const r = resObj.idea;
          setTitle(r.title);
          setDescription(r.description || "");
          setCategoryId(r.category_id);
        }
      } else {
        // Reset fields for Create Mode
        setTitle("");
        setDescription("");
        setCategoryId(catRes.categories[0]?.id || "");
      }

      setIsFetchingData(false);
    }

    loadInitialData();
  }, [isOpen, isEditMode, ideaId]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    setFieldErrors({});

    const formData: CreateIdeaInput = {
      title,
      description: description.trim() ? description : null,
      category_id: categoryId,
    };

    let result;
    if (isEditMode && ideaId) {
      result = await updateIdea(ideaId, formData);
    } else {
      result = await createIdea(formData);
    }

    if (result.error) {
      if (result.error.toLowerCase().includes("title") || result.error.toLowerCase().includes("category")) {
        const errors: Record<string, string> = {};
        if (result.error.toLowerCase().includes("title")) errors.title = "Title is required.";
        if (result.error.toLowerCase().includes("category")) errors.categoryId = "Category selection is required.";
        setFieldErrors(errors);
        setErrorMessage("Please fix the validation errors below.");
      } else {
        setErrorMessage(result.error);
      }
      setIsSaving(false);
    } else {
      setIsSaving(false);
      onSaveSuccess(isEditMode ? "Idea updated successfully!" : "Idea created successfully!");
      onClose();
    }
  };

  // Handle Inline Category Creation
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
      setCategoryId(newCat.id); // Select the newly created category automatically
      setNewCategoryName("");
      setIsAddingCategory(false);
      setIsCreatingCategory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-dark/25 backdrop-blur-[3px] transition-opacity duration-300 animate-fade-in"
        onClick={() => {
          if (!isSaving && !isCreatingCategory) onClose();
        }}
      />

      {/* Form Container */}
      <div className="bg-white w-full max-w-lg rounded-default shadow-xl border border-gray-100 p-6 md:p-8 relative z-10 animate-scale-up font-sans max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-5">
          <h2 className="font-serif text-xl font-bold text-brand-dark flex items-center gap-2">
            <span className="p-1.5 bg-brand-bg/40 text-brand-main2 rounded-full">
              <Icon name="ideas" size={18} />
            </span>
            <span>{isEditMode ? "Edit Idea Entry" : "Curate New Idea"}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-brand-dark disabled:opacity-30 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-800 border border-red-200 text-xs p-3.5 rounded-default mb-5 flex items-start gap-2 animate-fade-in">
            <Icon name="delete" size={14} className="flex-shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {isFetchingData ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Icon name="loader" size={32} className="animate-spin text-brand-main2" />
            <span className="text-xs font-semibold text-gray-400 tracking-wider">
              Loading configuration...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-widest text-brand-dark/50 uppercase">
                Idea Title
              </label>
              <input
                type="text"
                required
                disabled={isSaving}
                className={`w-full bg-white border rounded-default p-3 text-xs font-semibold text-brand-dark placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-main2/15 ${fieldErrors.title
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-brand-main2"
                  }`}
                placeholder="e.g. Multi-Tenant Caching Architecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {fieldErrors.title && (
                <span className="text-[10px] text-red-500 font-semibold">{fieldErrors.title}</span>
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
                      placeholder="e.g. System Design"
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
                rows={4}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-brand-main2 rounded-default p-3 text-xs font-semibold text-brand-dark placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-main2/15 resize-none"
                placeholder="Write a brief overview of the idea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
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
