import React from "react";
import { getIdeas, getCategories } from "@/features/dashboard/ideas/actions/ideasAction";
import { IdeasDashboardClient } from "@/features/dashboard/ideas/components/IdeasDashboardClient";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  // Parallel server fetches for immediate render data
  const [ideasResult, categoriesResult] = await Promise.all([
    getIdeas({ limit: 9, offset: 0 }),
    getCategories(),
  ]);

  return (
    <IdeasDashboardClient
      initialIdeas={ideasResult.ideas}
      initialTotalCount={ideasResult.totalCount}
      initialCategories={categoriesResult.categories}
    />
  );
}
