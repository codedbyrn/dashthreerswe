"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterBar";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ToolFormModal } from "./ToolFormModal";
import {
  getTools,
  deleteTool,
  toggleFavorite,
  getCategories,
} from "../actions/toolsAction";
import { Tool, Category } from "@/types/toolType";

interface ToolsDashboardClientProps {
  initialTools: Tool[];
  initialTotalCount: number;
  initialCategories: Category[];
}

export const ToolsDashboardClient: React.FC<ToolsDashboardClientProps> = ({
  initialTools,
  initialTotalCount,
  initialCategories,
}) => {
  // Lists State
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Pagination states
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(initialTools.length < initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Active Filter state
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("title_asc");

  // Layout View State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editToolId, setEditToolId] = useState<string | null>(null);
  const [deleteToolId, setDeleteToolId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Debounce search value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch updated list on filter change
  useEffect(() => {
    async function fetchFiltered() {
      setIsLoading(true);
      const res = await getTools({
        categoryId: selectedCategory,
        favoriteOnly: isFavoriteOnly,
        search: debouncedSearch,
        sortBy: sortBy,
        limit: 9,
        offset: 0,
      });

      if (!res.error) {
        setTools(res.tools);
        setOffset(0);
        setHasMore(res.tools.length < res.totalCount);
      }
      setIsLoading(false);
    }

    fetchFiltered();
  }, [selectedCategory, isFavoriteOnly, debouncedSearch, sortBy]);

  // Load more for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextOffset = offset + 9;
    const res = await getTools({
      categoryId: selectedCategory,
      favoriteOnly: isFavoriteOnly,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: nextOffset,
    });

    if (!res.error) {
      setTools((prev) => [...prev, ...res.tools]);
      setOffset(nextOffset);
      setHasMore((tools.length + res.tools.length) < res.totalCount);
    }
    setIsLoadingMore(false);
  };

  // Toggle favorite mutation
  const handleFavoriteToggle = async (toolId: string, currentFavorite: boolean) => {
    // Optimistic UI Update
    setTools((prev) =>
      prev.map((r) => (r.id === toolId ? { ...r, favorite: !currentFavorite } : r))
    );

    const res = await toggleFavorite(toolId, currentFavorite);
    if (res.error) {
      // Revert if error
      setTools((prev) =>
        prev.map((r) => (r.id === toolId ? { ...r, favorite: currentFavorite } : r))
      );
      setToastMessage(`Error: ${res.error}`);
    } else {
      setToastMessage("Favorite updated!");
    }
  };

  // Delete mutation
  const handleDeleteConfirm = async () => {
    if (!deleteToolId) return;
    setIsDeleting(true);

    const res = await deleteTool(deleteToolId);
    if (res.error) {
      setToastMessage(`Delete failed: ${res.error}`);
    } else {
      setTools((prev) => prev.filter((r) => r.id !== deleteToolId));
      setToastMessage("Tool removed from curation board.");
    }

    setIsDeleting(false);
    setDeleteToolId(null);
  };

  // Refresh categories after a new category creation inside modal
  const handleModalSave = async (msg: string) => {
    setToastMessage(msg);
    // Reload categories
    const catRes = await getCategories();
    if (!catRes.error) {
      setCategories(catRes.categories);
    }
    // Re-trigger active query
    setIsLoading(true);
    const res = await getTools({
      categoryId: selectedCategory,
      favoriteOnly: isFavoriteOnly,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: 0,
    });
    if (!res.error) {
      setTools(res.tools);
      setOffset(0);
      setHasMore(res.tools.length < res.totalCount);
    }
    setIsLoading(false);
  };

  // Category items mapping
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    label: c.category,
  }));

  // Render Skeleton Cards list
  const loaderSkeleton = (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }
    >
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={idx} isLoading={true} title="" />
      ))}
    </div>
  );

  // Render Empty State
  const emptyState = (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-100 rounded-default max-w-md w-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_24px]"></div>
      <div className="w-12 h-12 bg-brand-bg/50 border border-[#e4d7d0]/60 rounded-full flex items-center justify-center text-brand-main2 mb-4">
        <Icon name="sliders" size={24} />
      </div>
      <h3 className="font-serif text-base font-bold text-brand-dark mb-1">
        No Curation Items Found
      </h3>
      <p className="text-xs text-gray-500 font-sans leading-relaxed max-w-xs mb-5">
        There are no curated tools matching the current filters. Start adding design systems, plugins, code generators, or command line utilities.
      </p>
      <button
        onClick={() => {
          setSearchValue("");
          setSelectedCategory("all");
          setIsFavoriteOnly(false);
        }}
        className="px-4 py-2 border border-[#e4d7d0] hover:border-brand-main2 hover:text-brand-main2 text-gray-600 rounded-default text-xs font-semibold bg-white transition-all duration-180 cursor-pointer"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-brand-dark text-brand-bg px-4 py-3 rounded-default shadow-xl border border-brand-main1/20 z-50 text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <span className="h-2 w-2 rounded-full bg-brand-main2 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editorial Curation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e4d7d0]/60 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-brand-main2 uppercase">
            Curated Knowledge Management
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-dark mt-1">
            Utilities &amp; Tools
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-sans">
            Curate and store engineering tools, libraries, Figma plugins, and design helpers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Create button */}
          <button
            onClick={() => {
              setEditToolId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-brand-main2 hover:bg-brand-main2/95 text-white rounded-default shadow-sm transition-all duration-180 text-sm font-semibold cursor-pointer"
          >
            <Icon name="addIcon" size={14} className="stroke-[2.5]" />
            <span>Curate Tool</span>
          </button>
        </div>
      </div>

      {/* Reusable Filter Bar */}
      <FilterBar
        searchPlaceholder="Search titles or URLs..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categoryOptions}
        selectedCategoryId={selectedCategory}
        onCategorySelect={setSelectedCategory}
        categoryDisplayMode={categories.length > 5 ? "dropdown" : "pills"}
        showFavoriteToggle={true}
        isFavoriteOnly={isFavoriteOnly}
        onFavoriteOnlyToggle={setIsFavoriteOnly}
        selectedSortValue={sortBy}
        onSortSelect={setSortBy}
        showViewSwitch={true}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddCategoryClick={() => setIsFormOpen(true)}
      />

      {/* Infinite Scroll Container */}
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={isLoading || isLoadingMore}
        onLoadMore={handleLoadMore}
        isEmpty={tools.length === 0}
        emptyState={emptyState}
        loaderSkeleton={loaderSkeleton}
      >
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
              : "space-y-4 animate-fade-in"
          }
        >
          {tools.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              url={item.url}
              favorite={item.favorite}
              onFavoriteToggle={() => handleFavoriteToggle(item.id, item.favorite)}
              headerRight={
                item.category ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-bg/60 text-brand-dark/80 border border-[#e4d7d0]/40 uppercase tracking-wide">
                    {item.category.category}
                  </span>
                ) : undefined
              }
              onEdit={() => {
                setEditToolId(item.id);
                setIsFormOpen(true);
              }}
              onDelete={() => setDeleteToolId(item.id)}
            />
          ))}
        </div>
      </InfiniteScroll>

      {/* Form Dialog Modal */}
      <ToolFormModal
        isOpen={isFormOpen}
        toolId={editToolId}
        onClose={() => {
          setIsFormOpen(false);
          setEditToolId(null);
        }}
        onSaveSuccess={handleModalSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteToolId}
        title="Remove Curation Record"
        message="Are you sure you want to delete this tool entry? It will be removed from your lists permanentely."
        isLoading={isDeleting}
        onClose={() => setDeleteToolId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
