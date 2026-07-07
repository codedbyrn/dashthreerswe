"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/Icons";

export interface SortOption {
  value: string;
  label: string;
}

export interface CategoryOption {
  id: string;
  label: string;
}

export interface FilterBarProps {
  // Search
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Categories
  categories: CategoryOption[];
  selectedCategoryId: string; // "all" or specific uuid
  onCategorySelect: (id: string) => void;
  categoryDisplayMode?: "pills" | "dropdown";

  // Favorite Toggle (conditional display)
  showFavoriteToggle?: boolean;
  isFavoriteOnly: boolean;
  onFavoriteOnlyToggle: (value: boolean) => void;

  // Sorting
  sortOptions?: SortOption[];
  selectedSortValue: string;
  onSortSelect: (value: string) => void;

  // View Layout
  showViewSwitch?: boolean;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;

  // Inline category addition button (optional)
  onAddCategoryClick?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = "Search entries...",
  searchValue,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategorySelect,
  categoryDisplayMode = "pills",
  showFavoriteToggle = false,
  isFavoriteOnly,
  onFavoriteOnlyToggle,
  sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title_asc", label: "Title (A-Z)" },
    { value: "title_desc", label: "Title (Z-A)" },
  ],
  selectedSortValue,
  onSortSelect,
  showViewSwitch = false,
  viewMode = "grid",
  onViewModeChange,
  onAddCategoryClick,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedCategoryLabel =
    categories.find((c) => c.id === selectedCategoryId)?.label || "All Categories";

  const selectedSortLabel =
    sortOptions.find((o) => o.value === selectedSortValue)?.label || sortOptions[0]?.label || "";

  return (
    <div className="bg-white rounded-default p-4 shadow-sm border border-gray-100 flex flex-col gap-4 font-sans select-none w-full">
      {/* Top Filter Controls: Search & Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Icon name="search" size={15} />
          </span>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-brand-main2 rounded-default pl-10 pr-4 py-2 text-xs font-medium text-brand-dark placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-main2/15"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-dark cursor-pointer"
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>

        {/* Toggles, Sort & Layout Options */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Favorite Toggle */}
          {showFavoriteToggle && (
            <button
              onClick={() => onFavoriteOnlyToggle(!isFavoriteOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-default border text-xs font-semibold transition-all cursor-pointer ${
                isFavoriteOnly
                  ? "bg-brand-bg/50 border-brand-main2/30 text-brand-main2 shadow-sm"
                  : "bg-white border-[#e4d7d0]/60 text-gray-500 hover:text-brand-dark hover:border-gray-300"
              }`}
            >
              <Icon
                name={isFavoriteOnly ? "heartFilled" : "heart"}
                size={14}
                className={isFavoriteOnly ? "text-brand-main2" : ""}
              />
              <span>Favorites Only</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center justify-between gap-1.5 bg-white border border-[#e4d7d0]/60 hover:border-gray-300 px-3 py-2 rounded-default text-xs font-semibold text-gray-600 hover:text-brand-dark transition-all cursor-pointer"
            >
              <span className="text-gray-400 font-medium">Sort:</span>
              <span>{selectedSortLabel}</span>
              <Icon
                name="chevronDown"
                size={12}
                className={`transition-transform duration-200 ${
                  isSortDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-default shadow-xl z-20 py-1 divide-y divide-gray-50">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortSelect(opt.value);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      selectedSortValue === opt.value
                        ? "bg-brand-bg/30 text-brand-main2 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-brand-dark"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid/List View Switcher */}
          {showViewSwitch && onViewModeChange && (
            <div className="flex border border-[#e4d7d0]/60 rounded-default overflow-hidden bg-white shadow-sm p-[2px]">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-1.5 rounded-[4px] cursor-pointer transition-all ${
                  viewMode === "grid"
                    ? "bg-brand-bg text-brand-dark font-bold"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Grid View"
              >
                {/* Custom inline grid icon to avoid registry check */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-1.5 rounded-[4px] cursor-pointer transition-all ${
                  viewMode === "list"
                    ? "bg-brand-bg text-brand-dark font-bold"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="List View"
              >
                {/* Custom inline list icon to avoid registry check */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Category Filter Controls */}
      {categories.length > 0 && (
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between flex-wrap gap-2">
          {categoryDisplayMode === "dropdown" ? (
            /* Mode 1: Styled Custom Category Dropdown (many items) */
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 font-sans">Category:</span>
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center gap-1.5 bg-white border border-[#e4d7d0]/60 hover:border-gray-300 px-3.5 py-1.5 rounded-default text-xs font-semibold text-gray-600 hover:text-brand-dark transition-all cursor-pointer"
                >
                  <span>{selectedCategoryLabel}</span>
                  <Icon
                    name="chevronDown"
                    size={11}
                    className={`transition-transform duration-200 ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white border border-gray-100 rounded-default shadow-xl z-20 max-h-60 overflow-y-auto py-1 divide-y divide-gray-50">
                    <button
                      onClick={() => {
                        onCategorySelect("all");
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategoryId === "all"
                          ? "bg-brand-bg/30 text-brand-main2 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-brand-dark"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onCategorySelect(cat.id);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                          selectedCategoryId === cat.id
                            ? "bg-brand-bg/30 text-brand-main2 font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-brand-dark"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Mode 2: Horizontal Pill Filters (small number of items) */
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => onCategorySelect("all")}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  selectedCategoryId === "all"
                    ? "bg-brand-dark text-white border-brand-dark shadow-sm"
                    : "bg-white border-[#e4d7d0]/50 text-gray-500 hover:text-brand-dark hover:border-gray-300"
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategorySelect(cat.id)}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-dark text-white border-brand-dark shadow-sm"
                        : "bg-white border-[#e4d7d0]/50 text-gray-500 hover:text-brand-dark hover:border-gray-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Create Category Inline shortcut */}
          {onAddCategoryClick && (
            <button
              onClick={onAddCategoryClick}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-main2 hover:underline cursor-pointer ml-auto"
            >
              <Icon name="addIcon" size={12} className="stroke-[2.5]" />
              <span>New Category</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
