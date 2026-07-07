"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterBar";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PostFormModal } from "./PostFormModal";
import {
  getPosts,
  deletePost,
  getCategories,
} from "../actions/postsAction";
import { Post, Category } from "@/types/postType";

interface PostsDashboardClientProps {
  initialPosts: Post[];
  initialTotalCount: number;
  initialCategories: Category[];
}

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "In Review", label: "In Review" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
];

export const PostsDashboardClient: React.FC<PostsDashboardClientProps> = ({
  initialPosts,
  initialTotalCount,
  initialCategories,
}) => {
  // Lists State
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Pagination states
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(initialPosts.length < initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Active Filter state
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title_asc");

  // Layout View State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
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
      const res = await getPosts({
        categoryId: selectedCategory,
        status: selectedStatus,
        search: debouncedSearch,
        sortBy: sortBy,
        limit: 9,
        offset: 0,
      });

      if (!res.error) {
        setPosts(res.posts);
        setOffset(0);
        setHasMore(res.posts.length < res.totalCount);
      }
      setIsLoading(false);
    }

    fetchFiltered();
  }, [selectedCategory, selectedStatus, debouncedSearch, sortBy]);

  // Load more for infinite scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextOffset = offset + 9;
    const res = await getPosts({
      categoryId: selectedCategory,
      status: selectedStatus,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: nextOffset,
    });

    if (!res.error) {
      setPosts((prev) => [...prev, ...res.posts]);
      setOffset(nextOffset);
      setHasMore((posts.length + res.posts.length) < res.totalCount);
    }
    setIsLoadingMore(false);
  };

  // Delete mutation
  const handleDeleteConfirm = async () => {
    if (!deletePostId) return;
    setIsDeleting(true);

    const res = await deletePost(deletePostId);
    if (res.error) {
      setToastMessage(`Delete failed: ${res.error}`);
    } else {
      setPosts((prev) => prev.filter((r) => r.id !== deletePostId));
      setToastMessage("Post removed from curation board.");
    }

    setIsDeleting(false);
    setDeletePostId(null);
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
    const res = await getPosts({
      categoryId: selectedCategory,
      status: selectedStatus,
      search: debouncedSearch,
      sortBy: sortBy,
      limit: 9,
      offset: 0,
    });
    if (!res.error) {
      setPosts(res.posts);
      setOffset(0);
      setHasMore(res.posts.length < res.totalCount);
    }
    setIsLoading(false);
  };

  // Category items mapping
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    label: c.category,
  }));

  // Helper for status badge colors
  const getStatusBadge = (status: string) => {
    let colorClasses = "bg-gray-100 text-gray-700 border-gray-200";
    if (status === "In Review") {
      colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
    } else if (status === "Published") {
      colorClasses = "bg-green-50 text-green-800 border-green-200";
    } else if (status === "Archived") {
      colorClasses = "bg-blue-50 text-blue-800 border-blue-200";
    }
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wide ${colorClasses}`}>
        {status}
      </span>
    );
  };

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
        <Icon name="posts" size={24} />
      </div>
      <h3 className="font-serif text-base font-bold text-brand-dark mb-1">
        No Posts Found
      </h3>
      <p className="text-xs text-gray-500 font-sans leading-relaxed max-w-xs mb-5">
        There are no curated posts matching the current filters. Start writing and cataloging engineering logs or documentation drafts.
      </p>
      <button
        onClick={() => {
          setSearchValue("");
          setSelectedCategory("all");
          setSelectedStatus("all");
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
            Articles &amp; Posts
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-sans">
            Store, track, and catalog engineering write-ups, devlogs, and documentation resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditPostId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-brand-main2 hover:bg-brand-main2/95 text-white rounded-default shadow-sm transition-all duration-180 text-sm font-semibold cursor-pointer"
          >
            <Icon name="addIcon" size={14} className="stroke-[2.5]" />
            <span>Curate Post</span>
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

      {/* Inline Status Filter Row */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-default p-3.5 border border-gray-100 shadow-sm">
        <span className="text-xs font-semibold text-gray-400 mr-2">Status Filter:</span>
        {STATUS_FILTERS.map((st) => {
          const isSelected = selectedStatus === st.value;
          return (
            <button
              key={st.value}
              onClick={() => setSelectedStatus(st.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand-main2 text-white border-brand-main2 shadow-sm"
                  : "bg-white border-[#e4d7d0]/50 text-gray-500 hover:text-brand-dark hover:border-gray-300"
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      {/* Infinite Scroll Container */}
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={isLoading || isLoadingMore}
        onLoadMore={handleLoadMore}
        isEmpty={posts.length === 0}
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
          {posts.map((item) => (
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
              headerRight={getStatusBadge(item.status)}
              onEdit={() => {
                setEditPostId(item.id);
                setIsFormOpen(true);
              }}
              onDelete={() => setDeletePostId(item.id)}
            />
          ))}
        </div>
      </InfiniteScroll>

      {/* Form Dialog Modal */}
      <PostFormModal
        isOpen={isFormOpen}
        postId={editPostId}
        onClose={() => {
          setIsFormOpen(false);
          setEditPostId(null);
        }}
        onSaveSuccess={handleModalSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletePostId}
        title="Remove Curation Record"
        message="Are you sure you want to delete this post entry? It will be removed from your lists permanentely."
        isLoading={isDeleting}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
