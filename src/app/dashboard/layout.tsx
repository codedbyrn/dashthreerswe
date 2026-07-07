"use client";

import React from "react";
import { DashboardLayoutProvider } from "@/components/DashboardLayoutContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutProvider>
      <div className="flex flex-col min-h-screen bg-brand-bg/25">
        {/* Top Navbar */}
        <Navbar />

        {/* Workspace Container */}
        <div className="flex-1 flex relative">
          {/* Collapsible Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-y-auto relative p-4 sm:p-4 md:p-4">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayoutProvider>
  );
}
