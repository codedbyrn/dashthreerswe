import React from "react";
import { notFound } from "next/navigation";
import { getResourceById } from "@/features/dashboard/resources/actions/resourcesAction";
import { EditResourceClient } from "@/features/dashboard/resources/components/EditResourceClient";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditResourcePage({ params }: EditPageProps) {
  // Await params per latest Next.js 15/16 specifications
  const { id } = await params;

  // Retrieve existing record from database on the server
  const { resource, error } = await getResourceById(id);

  // If resource not found or error, render standard 404 page
  if (error || !resource) {
    notFound();
  }

  return <EditResourceClient resource={resource} />;
}
