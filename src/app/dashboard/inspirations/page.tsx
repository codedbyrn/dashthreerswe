import React from "react";
import { getInspirations, getCategories } from "@/features/dashboard/inspirations/actions/inspirationsAction";
import { InspirationsDashboardClient } from "@/features/dashboard/inspirations/components/InspirationsDashboardClient";

export const dynamic = "force-dynamic";

export default async function InspirationsPage() {
  // Parallel server fetches for immediate render data
  const [inspirationsResult, categoriesResult] = await Promise.all([
    getInspirations({ limit: 9, offset: 0 }),
    getCategories(),
  ]);

  return (
    <InspirationsDashboardClient
      initialInspirations={inspirationsResult.inspirations}
      initialTotalCount={inspirationsResult.totalCount}
      initialCategories={categoriesResult.categories}
    />
  );
}
