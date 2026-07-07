import React from "react";
import { getTools, getCategories } from "@/features/dashboard/tools/actions/toolsAction";
import { ToolsDashboardClient } from "@/features/dashboard/tools/components/ToolsDashboardClient";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  // Parallel server fetches for immediate render data
  const [toolsResult, categoriesResult] = await Promise.all([
    getTools({ limit: 9, offset: 0 }),
    getCategories(),
  ]);

  return (
    <ToolsDashboardClient
      initialTools={toolsResult.tools}
      initialTotalCount={toolsResult.totalCount}
      initialCategories={categoriesResult.categories}
    />
  );
}
