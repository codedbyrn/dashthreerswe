import React from "react";
import { getPosts, getCategories } from "@/features/dashboard/posts/actions/postsAction";
import { PostsDashboardClient } from "@/features/dashboard/posts/components/PostsDashboardClient";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  // Parallel server fetches for immediate render data
  const [postsResult, categoriesResult] = await Promise.all([
    getPosts({ limit: 9, offset: 0 }),
    getCategories(),
  ]);

  return (
    <PostsDashboardClient
      initialPosts={postsResult.posts}
      initialTotalCount={postsResult.totalCount}
      initialCategories={categoriesResult.categories}
    />
  );
}
