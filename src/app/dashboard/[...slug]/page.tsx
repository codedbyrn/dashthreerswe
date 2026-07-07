"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { navigationConfig } from "@/data/navigation";
import { Icon } from "@/components/Icons";
import Link from "next/link";

export default function CatchAllDashboardPage() {
  const pathname = usePathname();

  // Find the details of the active item from our centralized configuration
  let activeSubItem = null;
  for (const mainItem of navigationConfig) {
    const found = mainItem.subItems.find((sub) => sub.href === pathname);
    if (found) {
      activeSubItem = found;
      break;
    }
  }

  // Fallback labels if not found in configuration
  const pageLabel = activeSubItem ? activeSubItem.label : "Workspace Module";
  const iconName = activeSubItem ? activeSubItem.iconName : "files";

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e4d7d0]/60 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-brand-main2 uppercase">
            Active Module
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-dark mt-1">
            {pageLabel}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-sans">
            Curated view for <span className="font-semibold text-brand-dark">{pathname}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-[#e4d7d0] hover:border-brand-main2 hover:text-brand-main2 text-gray-600 rounded-default shadow-sm transition-all duration-180 text-sm font-semibold bg-white cursor-pointer"
          >
            <Icon name="dashboard" size={16} />
            Back to Overview
          </Link>
        </div>
      </div>

      {/* Styled Notebook Curation Page Canvas */}
      <div className="bg-white rounded-default shadow-md p-10 min-h-[400px] border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Notebook line rules style watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(#320809_1px,transparent_1px)] bg-[size:100%_28px]"></div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-bg/50 border border-[#e4d7d0] text-brand-main2 flex items-center justify-center mx-auto shadow-sm">
            <Icon name={iconName} size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-brand-dark">
              Curation Board Under Development
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-serif">
              This editorial module is mapped in the centralized configuration object. High-end page-editing and stationery controls for <strong className="text-brand-dark">{pageLabel}</strong> are scheduled for the next release.
            </p>
          </div>

          <div className="p-4 bg-brand-bg/20 rounded-default border border-[#e4d7d0]/40 text-xs text-brand-dark/70 font-sans space-y-1.5 text-left">
            <div className="font-bold text-[10px] tracking-wide text-brand-main2 uppercase">Centralized Config Details:</div>
            <div><span className="font-semibold text-brand-dark">Module ID:</span> {activeSubItem?.id || "unknown"}</div>
            <div><span className="font-semibold text-brand-dark">Path Endpoint:</span> {pathname}</div>
            <div><span className="font-semibold text-brand-dark">SVG Icon Tag:</span> {iconName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
