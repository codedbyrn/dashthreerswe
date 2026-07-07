"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterBar";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InspirationFormModal } from "./InspirationFormModal";
import {
  getInspirations,
  deleteInspiration,
  toggleFavorite,
  getCategories,
} from "../actions/inspirationsAction";
import { Inspiration, Category } from "@/types/inspirationType";

interface InspirationsDashboardClientProps {
  initialInspirations: Inspiration[];
  initialTotalCount: number;
  initialCategories: Category[];
}

export const InspirationsDashboardClient: React.FC<InspirationsDashboardClientProps> = ({
  initialInspirations,
  initialTotalCount,
  initialCategories,
}) => {
  // Lists State
  const [inspirations, setInspirations] = useState<Inspiration[]>(initialInspirations);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Pagination states
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(initialInspirations.length < initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Active Filter state
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("description_asc");

  // Layout View State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editInspirationId, setEditInspirationId] = useState<string | null>(null);
  const [deleteInspirationId, setDeleteInspirationId] = useState<string | null>(null);
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
      const res = await getInspirations({
        categoryId: selectedCategory,
        favoriteOnly: isFavoriteOnly,
        search: debouncedSearch,
        sortBy: sortBy,
        limit: 9,
        offset: 0,
      });

      if (!res.error) {
        setInspirations(res.inspirations);
        setOffset(0);
        setHasMore(res.inspirations.length < res.totalCount);
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
    const res = await getInspirations({
      categoryId: selectedCategory,
      favoriteOnly: isFavoriteOnly,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: nextOffset,
    });

    if (!res.error) {
      setInspirations((prev) => [...prev, ...res.inspirations]);
      setOffset(nextOffset);
      setHasMore((inspirations.length + res.inspirations.length) < res.totalCount);
    }
    setIsLoadingMore(false);
  };

  // Toggle favorite mutation
  const handleFavoriteToggle = async (inspirationId: string, currentFavorite: boolean) => {
    // Optimistic UI Update
    setInspirations((prev) =>
      prev.map((r) => (r.id === inspirationId ? { ...r, favorite: !currentFavorite } : r))
    );

    const res = await toggleFavorite(inspirationId, currentFavorite);
    if (res.error) {
      // Revert if error
      setInspirations((prev) =>
        prev.map((r) => (r.id === inspirationId ? { ...r, favorite: currentFavorite } : r))
      );
      setToastMessage(`Error: ${res.error}`);
    } else {
      setToastMessage("Favorite updated!");
    }
  };

  // Delete mutation
  const handleDeleteConfirm = async () => {
    if (!deleteInspirationId) return;
    setIsDeleting(true);

    const res = await deleteInspiration(deleteInspirationId);
    if (res.error) {
      setToastMessage(`Delete failed: ${res.error}`);
    } else {
      setInspirations((prev) => prev.filter((r) => r.id !== deleteInspirationId));
      setToastMessage("Inspiration removed from curation board.");
    }

    setIsDeleting(false);
    setDeleteInspirationId(null);
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
    const res = await getInspirations({
      categoryId: selectedCategory,
      favoriteOnly: isFavoriteOnly,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: 0,
    });
    if (!res.error) {
      setInspirations(res.inspirations);
      setOffset(0);
      setHasMore(res.inspirations.length < res.totalCount);
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
        <Icon name="image" size={24} />
      </div>
      <h3 className="font-serif text-base font-bold text-brand-dark mb-1">
        No Curation Items Found
      </h3>
      <p className="text-xs text-gray-500 font-sans leading-relaxed max-w-xs mb-5">
        There are no curated inspirations matching the current filters. Start adding moodboards, visual concepts, or design layouts.
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
            Inspirations &amp; Moodboards
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-sans">
            Curate and store design references, imagery, aesthetic layouts, and visual inspirations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Create button */}
          <button
            onClick={() => {
              setEditInspirationId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-brand-main2 hover:bg-brand-main2/95 text-white rounded-default shadow-sm transition-all duration-180 text-sm font-semibold cursor-pointer"
          >
            <Icon name="addIcon" size={14} className="stroke-[2.5]" />
            <span>Curate Inspiration</span>
          </button>
        </div>
      </div>

      {/* Reusable Filter Bar */}
      <FilterBar
        searchPlaceholder="Search descriptions or URLs..."
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
        isEmpty={inspirations.length === 0}
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
          {inspirations.map((item) => (
            <Card
              key={item.id}
              title={item.category ? item.category.category : "Curated Inspiration"}
              url={item.url}
              coverImage={item.img}
              primaryDescription={item.description}
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
                setEditInspirationId(item.id);
                setIsFormOpen(true);
              }}
              onDelete={() => setDeleteInspirationId(item.id)}
            />
          ))}
        </div>
      </InfiniteScroll>

      {/* Form Dialog Modal */}
      <InspirationFormModal
        isOpen={isFormOpen}
        inspirationId={editInspirationId}
        onClose={() => {
          setIsFormOpen(false);
          setEditInspirationId(null);
        }}
        onSaveSuccess={handleModalSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteInspirationId}
        title="Remove Curation Record"
        message="Are you sure you want to delete this inspiration entry? It will be removed from your lists permanentely."
        isLoading={isDeleting}
        onClose={() => setDeleteInspirationId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
