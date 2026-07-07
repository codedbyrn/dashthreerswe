"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";
import { ResourceForm } from "@/features/dashboard/resources/components/ResourceForm";

export default function NewResourcePage() {
  const router = useRouter();

  const handleSaveSuccess = (message: string) => {
    // Navigate back to the list and pass a success query or simply rely on revalidation
    router.push("/dashboard/resources");
  };

  const handleCancel = () => {
    router.push("/dashboard/resources");
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e4d7d0]/60 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-brand-main2 uppercase">
            Curate New Entry
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-dark mt-1">
            New Knowledge Resource
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-sans">
            Add a new reference material, research article, or tool to the knowledge curation board.
          </p>
        </div>

        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 border border-[#e4d7d0] hover:border-brand-main2 hover:text-brand-main2 text-gray-600 rounded-default shadow-sm transition-all duration-180 text-sm font-semibold bg-white cursor-pointer"
        >
          <Icon name="chevronLeft" size={16} />
          <span>Back to List</span>
        </button>
      </div>

      {/* Reusable Form Wrapper */}
      <div className="max-w-xl mx-auto py-4">
        <ResourceForm
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
