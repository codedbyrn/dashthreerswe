"use client";

import React, { useEffect, useRef } from "react";

export interface InfiniteScrollProps {
  // Elements to render
  children: React.ReactNode;
  
  // Skeletons during fetch
  loaderSkeleton?: React.ReactNode;
  
  // Custom Empty view
  isEmpty?: boolean;
  emptyState?: React.ReactNode;

  // Pagination states
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;

  // Configuration
  threshold?: number; // threshold 0.0 - 1.0 (defaults to 0.1)
  rootMargin?: string; // intersection offset margin (defaults to "200px")
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loaderSkeleton,
  isEmpty = false,
  emptyState,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = "200px",
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);

  // Keep loadMore callback updated to avoid closure traps
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    // If no more items are left to load, or we are currently fetching, do not watch.
    if (!hasMore || isLoading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          loadMoreRef.current();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [hasMore, isLoading, threshold, rootMargin]);

  // --- 1. EMPTY STATE ---
  if (isEmpty && !isLoading) {
    return <div className="w-full flex justify-center py-12">{emptyState}</div>;
  }

  // --- 2. CONTAINER STACK ---
  return (
    <div className="space-y-6 w-full">
      {/* The main items grid/list */}
      {children}

      {/* Skeletons block while loading */}
      {isLoading && loaderSkeleton && (
        <div className="w-full">
          {loaderSkeleton}
        </div>
      )}

      {/* Invisible sentinel element at the bottom to trigger fetches */}
      {hasMore && !isLoading && (
        <div
          ref={sentinelRef}
          className="h-10 w-full pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Muted tiny loader dot to show interaction readiness */}
          <span className="h-1.5 w-1.5 rounded-full bg-brand-main2/20 animate-ping"></span>
        </div>
      )}

      {/* Completed indicator */}
      {!hasMore && !isEmpty && (
        <div className="text-center py-8 text-xs font-serif text-gray-400 select-none">
          — All publications loaded —
        </div>
      )}
    </div>
  );
};
