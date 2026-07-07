"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterBar";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IdeaFormModal } from "./IdeaFormModal";
import {
  getIdeas,
  deleteIdea,
  getCategories,
} from "../actions/ideasAction";
import { Idea, Category } from "@/types/ideaType";

interface IdeasDashboardClientProps {
  initialIdeas: Idea[];
  initialTotalCount: number;
  initialCategories: Category[];
}

export const IdeasDashboardClient: React.FC<IdeasDashboardClientProps> = ({
  initialIdeas,
  initialTotalCount,
  initialCategories,
}) => {
  // Lists State
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Pagination states
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(initialIdeas.length < initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Active Filter state
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title_asc");

  // Layout View State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editIdeaId, setEditIdeaId] = useState<string | null>(null);
  const [deleteIdeaId, setDeleteIdeaId] = useState<string | null>(null);
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
      const res = await getIdeas({
        categoryId: selectedCategory,
        search: debouncedSearch,
        sortBy: sortBy,
        limit: 9,
        offset: 0,
      });

      if (!res.error) {
        setIdeas(res.ideas);
        setOffset(0);
        setHasMore(res.ideas.length < res.totalCount);
      }
      setIsLoading(false);
    }

    fetchFiltered();
  }, [selectedCategory, debouncedSearch, sortBy]);

  // Load more for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextOffset = offset + 9;
    const res = await getIdeas({
      categoryId: selectedCategory,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: nextOffset,
    });

    if (!res.error) {
      setIdeas((prev) => [...prev, ...res.ideas]);
      setOffset(nextOffset);
      setHasMore((ideas.length + res.ideas.length) < res.totalCount);
    }
    setIsLoadingMore(false);
  };

  // Delete mutation
  const handleDeleteConfirm = async () => {
    if (!deleteIdeaId) return;
    setIsDeleting(true);

    const res = await deleteIdea(deleteIdeaId);
    if (res.error) {
      setToastMessage(`Delete failed: ${res.error}`);
    } else {
      setIdeas((prev) => prev.filter((r) => r.id !== deleteIdeaId));
      setToastMessage("Idea removed from curation board.");
    }

    setIsDeleting(false);
    setDeleteIdeaId(null);
  };

  // Refresh categories after a new category creation inside modal
  const handleModalSave = async (msg: string) => {
    setToastMessage(msg);
    const catRes = await getCategories();
    if (!catRes.error) {
      setCategories(catRes.categories);
    }
    // Re-trigger active query
    setIsLoading(true);
    const res = await getIdeas({
      categoryId: selectedCategory,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: 0,
    });
    if (!res.error) {
      setIdeas(res.ideas);
      setOffset(0);
      setHasMore(res.ideas.length < res.totalCount);
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
        <Icon name="ideas" size={24} />
      </div>
      <h3 className="font-serif text-base font-bold text-brand-dark mb-1">
        No Ideas Found
      </h3>
      <p className="text-xs text-gray-500 font-sans leading-relaxed max-w-xs mb-5">
        There are no curated ideas matching the current filters. Start adding system architecture designs, product concepts, or project plans.
      </p>
      <button
        onClick={() => {
          setSearchValue("");
          setSelectedCategory("all");
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
            Concepts &amp; Ideas
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-sans">
            Store, track, and brainstorm system architecture ideas, project proposals, and draft concepts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditIdeaId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-brand-main2 hover:bg-brand-main2/95 text-white rounded-default shadow-sm transition-all duration-180 text-sm font-semibold cursor-pointer"
          >
            <Icon name="addIcon" size={14} className="stroke-[2.5]" />
            <span>Curate Idea</span>
          </button>
        </div>
      </div>

      {/* Reusable Filter Bar */}
      <FilterBar
        searchPlaceholder="Search titles or descriptions..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categoryOptions}
        selectedCategoryId={selectedCategory}
        onCategorySelect={setSelectedCategory}
        categoryDisplayMode={categories.length > 5 ? "dropdown" : "pills"}
        showFavoriteToggle={false}
        isFavoriteOnly={false}
        onFavoriteOnlyToggle={() => {}}
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
        isEmpty={ideas.length === 0}
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
          {ideas.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              primaryDescription={item.description}
              headerLeft={
                item.category ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-bg/60 text-brand-dark/80 border border-[#e4d7d0]/40 uppercase tracking-wide">
                    {item.category.category}
                  </span>
                ) : undefined
              }
              onEdit={() => {
                setEditIdeaId(item.id);
                setIsFormOpen(true);
              }}
              onDelete={() => setDeleteIdeaId(item.id)}
            />
          ))}
        </div>
      </InfiniteScroll>

      {/* Form Dialog Modal */}
      <IdeaFormModal
        isOpen={isFormOpen}
        ideaId={editIdeaId}
        onClose={() => {
          setIsFormOpen(false);
          setEditIdeaId(null);
        }}
        onSaveSuccess={handleModalSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteIdeaId}
        title="Remove Curation Record"
        message="Are you sure you want to delete this idea entry? It will be removed from your lists permanentely."
        isLoading={isDeleting}
        onClose={() => setDeleteIdeaId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
