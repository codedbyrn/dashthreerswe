import React from "react";
// يجلب البيانات من السيرفر: Resources + All Categories
import { getResources, getCategories } from "@/features/dashboard/resources/actions/resourcesAction";
// ثم يرسل البيانات إلى: الذي سيعرض البيانات للمستخدم.
/**
 * Client Component ("use client")
يحتوي على:
البحث.
الفلاتر.
الإضافة والتعديل والحذف.
التصفح اللانهائي (Infinite Scroll). */
import { ResourcesDashboardClient } from "@/features/dashboard/resources/components/ResourcesDashboardClient";

//  لا تقم بإنشاء الصفحة أثناء عملية البناء Build Time = Disable build-time prerendering since queries depend on request-time cookies
export const dynamic = "force-dynamic";

// Server Component
/**
 *  Server Component
 */
export default async function ResourcesPage() {
  // Parallel server fetches for immediate render data
  const [resourcesResult, categoriesResult] = await Promise.all([
    getResources({ limit: 9, offset: 0, sortBy: "title_asc" }),
    getCategories(),
  ]);

  return (
    <ResourcesDashboardClient
      initialResources={resourcesResult.resources}
      initialTotalCount={resourcesResult.totalCount}
      initialCategories={categoriesResult.categories}
    />
  );
}

