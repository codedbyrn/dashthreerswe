import React from "react";
import Link from "next/link";
import { createClient } from "@/auth/utils/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // Mock dashboard stats
  const stats = [
    { label: "Active Articles", value: "148", change: "+12.4%", icon: "files", trend: "up" },
    { label: "Total Subscribers", value: "2,840", change: "+8.2%", icon: "users", trend: "up" },
    { label: "Pending Orders", value: "12", change: "-15.3%", icon: "shoppingBag", trend: "down" },
    { label: "Monthly Revenue", value: "$18,240", change: "+24.1%", icon: "receipt", trend: "up" },
  ];

  // Mock recent articles/documents list
  const recentItems = [
    {
      id: "doc-1",
      title: "The Renaissance of Tactile User Interfaces",
      author: "Reem Najeeb",
      status: "Published",
      statusType: "success",
      date: "Jun 24, 2026",
      priority: "High",
    },
    {
      id: "doc-2",
      title: "Editorial Typography in Modern Web Products",
      author: "Sarah Connor",
      status: "In Review",
      statusType: "warning",
      date: "Jun 22, 2026",
      priority: "Low",
    },
    {
      id: "doc-3",
      title: "Designing for Slow Reading and High Focus",
      author: "John Doe",
      status: "Draft",
      statusType: "info",
      date: "Jun 19, 2026",
      priority: "High",
    },
    {
      id: "doc-4",
      title: "Supabase Integration in Next.js Server Actions",
      author: "Jane Smith",
      status: "Archived",
      statusType: "error",
      date: "Jun 15, 2026",
      priority: "Low",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e4d7d0]/60 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-brand-main2 uppercase">
            System Dashboard
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-dark mt-1">
            Editorial Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-sans">
            Welcome back, Reem. Manage content curation, user accounts, and shop transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/users"
            className="flex items-center gap-2 px-4 py-2 bg-brand-main2 hover:bg-brand-main2/95 text-white rounded-default shadow-sm transition-all duration-180 text-sm font-semibold cursor-pointer"
          >
            <Icon name="users" size={16} />
            Manage Employees
          </Link>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-default p-6 shadow-md border-0 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs font-bold tracking-wider text-brand-dark/50 uppercase">
                {stat.label}
              </span>
              <div className="p-2 bg-brand-bg/40 text-brand-main2 rounded-full">
                <Icon name={stat.icon} size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-numeric text-3xl font-semibold text-brand-dark">
                {stat.value}
              </span>
              <span
                className={`text-xs font-semibold ${
                  stat.trend === "up" ? "text-green-700" : "text-red-700"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Recent Documents Grid & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Items Table (2/3 width on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-default shadow-md overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-brand-dark">
              Recent Publications & Articles
            </h2>
            <span className="text-xs text-brand-main2 hover:underline cursor-pointer">
              View All
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  <th className="px-6 py-3">Article Title</th>
                  <th className="px-6 py-3">Curation</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-brand-bg/10 transition-all duration-180 min-h-[56px]"
                  >
                    <td className="px-6 py-4">
                      <div className="font-serif text-sm font-semibold text-brand-dark truncate max-w-xs">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                        {item.date} • {item.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      Editorial Dept.
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.statusType === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : item.statusType === "warning"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : item.statusType === "info"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold ${
                          item.priority === "High" ? "text-brand-main1" : "text-gray-400"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
            Showing latest 4 editorial items
          </div>
        </div>

        {/* Curation Quick Actions & Systems (1/3 width) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-default p-6 shadow-md">
            <h2 className="font-serif text-lg font-bold text-brand-dark border-b border-gray-100 pb-3 mb-4">
              Curation Tools
            </h2>
            <div className="space-y-3 font-sans text-sm">
              <button className="w-full flex items-center justify-between p-3 rounded-default border border-[#e4d7d0] hover:border-brand-main2 hover:bg-brand-bg/10 text-brand-dark transition-all duration-150 text-left">
                <div className="flex items-center gap-3">
                  <Icon name="files" size={18} className="text-brand-main2" />
                  <span className="font-semibold">Compose New Entry</span>
                </div>
                <Icon name="chevronRight" size={14} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-default border border-[#e4d7d0] hover:border-brand-main2 hover:bg-brand-bg/10 text-brand-dark transition-all duration-150 text-left">
                <div className="flex items-center gap-3">
                  <Icon name="image" size={18} className="text-brand-main2" />
                  <span className="font-semibold">Update Hero Banner</span>
                </div>
                <Icon name="chevronRight" size={14} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-default border border-[#e4d7d0] hover:border-brand-main2 hover:bg-brand-bg/10 text-brand-dark transition-all duration-150 text-left">
                <div className="flex items-center gap-3">
                  <Icon name="sliders" size={18} className="text-brand-main2" />
                  <span className="font-semibold">Review Page Config</span>
                </div>
                <Icon name="chevronRight" size={14} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* System Profile Card */}
          <div className="bg-brand-dark text-brand-bg rounded-default p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
              <Icon name="activity" size={180} />
            </div>
            <div className="relative z-10 space-y-4">
              <span className="text-[9px] font-bold tracking-widest text-[#E87F81] uppercase">
                System Status
              </span>
              <h3 className="font-serif text-xl font-bold leading-tight">
                Database Node Online
              </h3>
              <p className="text-xs text-brand-bg/70 leading-relaxed font-sans">
                Connection to Supabase and role synchronization policies are actively running in Europe-West.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
                <span>Latency: 42ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
