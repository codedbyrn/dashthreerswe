"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardLayout } from "./DashboardLayoutContext";
import { navigationConfig, MainNavigationItem } from "@/data/navigation";
import { Icon } from "./Icons";
import { signOut } from "@/auth/services/authService";

export default function Sidebar() {
  const pathname = usePathname();
  const {
    activeMainNavId,
    setActiveMainNavId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    unreadNotificationsCount,
  } = useDashboardLayout();

  // For Mobile: Track which accordion is open
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  // Initialize mobile accordion to the active main navigation item
  useEffect(() => {
    setOpenAccordionId(activeMainNavId);
  }, [activeMainNavId]);

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
    }
  };

  // Find sub-navigation items for current active main navigation
  const activeMainItem = navigationConfig.find((item) => item.id === activeMainNavId);
  const subItems = activeMainItem ? activeMainItem.subItems : [];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP SIDEBAR                                       */}
      {/* ======================================================== */}
      <aside
        className={`hidden md:flex flex-col justify-between h-[calc(100vh-61px)] bg-white border-r border-[#e4d7d0] sticky top-[61px] left-0 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="flex flex-col">
          {/* Top Section: Profile Info */}
          <div
            className={`flex flex-col border-b border-[#e4d7d0]/60 transition-all duration-300 ${
              isSidebarCollapsed ? "p-4 items-center" : "p-6"
            }`}
          >
            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-brand-main2/10 border border-brand-main2/20 flex items-center justify-center font-serif text-brand-main2 text-base font-bold select-none">
                RN
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-sm font-semibold text-brand-dark truncate leading-tight">
                    Reem Najeeb
                  </h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    reemnajeeb@gmail.com
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sub-navigation Links */}
          <div className="p-3 space-y-1.5 flex-1">
            {!isSidebarCollapsed && (
              <div className="px-3 py-2 text-[10px] font-sans font-bold tracking-widest text-brand-dark/40 uppercase">
                {activeMainItem?.label || "Navigation"}
              </div>
            )}

            {subItems.map((subItem) => {
              const isSubActive = pathname === subItem.href;
              return (
                <Link
                  key={subItem.id}
                  href={subItem.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-default transition-all duration-200 group relative ${
                    isSubActive
                      ? "bg-brand-bg text-brand-dark border-l-2 border-brand-main2 font-semibold"
                      : "text-gray-500 hover:text-brand-dark hover:bg-gray-50 border-l-2 border-transparent"
                  }`}
                >
                  <Icon
                    name={subItem.iconName}
                    size={20}
                    className={`flex-shrink-0 transition-transform group-hover:scale-105 duration-200 ${
                      isSubActive ? "text-brand-main2" : "text-gray-400 group-hover:text-brand-dark"
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="text-sm tracking-wide truncate">{subItem.label}</span>
                  )}
                  {/* Collapsed Tooltip */}
                  {isSidebarCollapsed && (
                    <span className="absolute left-full ml-4 px-2 py-1 bg-brand-dark text-white text-xs rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {subItem.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Collapsed State Toggle Button at Bottom */}
        <div className="p-4 border-t border-[#e4d7d0]/60 flex items-center justify-center">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-full hover:bg-brand-bg/50 text-gray-400 hover:text-brand-dark transition-all duration-200 focus:outline-none cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Icon name={isSidebarCollapsed ? "chevronRight" : "chevronLeft"} size={16} />
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER SIDEBAR                                 */}
      {/* ======================================================== */}
      {/* Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white flex flex-col justify-between shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header & Profile */}
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-[#e4d7d0] flex items-center justify-between">
            <span className="font-serif text-xl font-bold text-brand-dark">
              reem<span className="text-brand-main2">.N</span>
            </span>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-brand-dark"
              aria-label="Close menu"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          {/* Profile Details */}
          <div className="p-5 bg-brand-bg/30 border-b border-[#e4d7d0]/60 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-main2/10 border border-brand-main2/20 flex items-center justify-center font-serif text-brand-main2 text-lg font-bold">
              RN
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base font-semibold text-brand-dark leading-tight truncate">
                Reem Najeeb
              </h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                reemnajeeb@gmail.com
              </p>
            </div>
          </div>

          {/* Accordion Menu for Main Nav categories */}
          <div className="p-4 space-y-3 flex-grow">
            <div className="text-[10px] font-sans font-bold tracking-widest text-brand-dark/40 uppercase mb-2 px-1">
              Navigation Menu
            </div>

            {navigationConfig.map((mainItem) => {
              const isAccordionOpen = openAccordionId === mainItem.id;
              const isParentActive = activeMainNavId === mainItem.id;

              return (
                <div key={mainItem.id} className="border border-[#e4d7d0]/60 rounded-default overflow-hidden bg-gray-50/50">
                  {/* Accordion Trigger */}
                  <button
                    onClick={() => {
                      setOpenAccordionId(isAccordionOpen ? null : mainItem.id);
                      setActiveMainNavId(mainItem.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 text-sm font-semibold transition-colors text-left ${
                      isParentActive
                        ? "bg-brand-bg/60 text-brand-dark"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{mainItem.label}</span>
                    <Icon
                      name="chevronDown"
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${
                        isAccordionOpen ? "rotate-180 text-brand-dark" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion Content (Submenus) */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isAccordionOpen ? "max-h-96 border-t border-[#e4d7d0]/40" : "max-h-0"
                    }`}
                  >
                    <div className="p-1.5 space-y-1 bg-white">
                      {mainItem.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.id}
                            href={subItem.href}
                            onClick={() => setIsMobileOpen(false)} // Close drawer on selection
                            className={`flex items-center gap-3 px-3 py-2 rounded-default transition-all duration-150 ${
                              isSubActive
                                ? "bg-brand-bg text-brand-dark font-semibold border-l-2 border-brand-main2"
                                : "text-gray-500 hover:text-brand-dark hover:bg-gray-50 border-l-2 border-transparent"
                            }`}
                          >
                            <Icon
                              name={subItem.iconName}
                              size={18}
                              className={isSubActive ? "text-brand-main2" : "text-gray-400"}
                            />
                            <span className="text-sm">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Bottom Section */}
        <div className="p-4 border-t border-[#e4d7d0] bg-white space-y-2">
          {/* Employee Management Link */}
          <Link
            href="/dashboard/users"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-default text-sm font-semibold transition-all duration-150 ${
              pathname.startsWith("/dashboard/users")
                ? "bg-brand-main2 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon name="users" size={18} />
            <span>Employee Management</span>
          </Link>

          {/* Notifications Link */}
          <Link
            href="/dashboard/notifications"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-default text-sm font-semibold transition-all duration-150 ${
              pathname === "/dashboard/notifications"
                ? "bg-brand-bg text-brand-dark font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon name="bell" size={18} />
              <span>Notifications</span>
            </div>
            {unreadNotificationsCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-main2 text-[10px] font-bold text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </Link>

          {/* Settings Link */}
          <Link
            href="/dashboard/settings"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-default text-sm font-semibold transition-all duration-150 ${
              pathname === "/dashboard/settings"
                ? "bg-brand-bg text-brand-dark font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon name="settings" size={18} />
            <span>Settings</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-default text-sm font-semibold text-brand-main2 hover:bg-primary-50 transition-all duration-150 text-left cursor-pointer"
          >
            <Icon name="logout" size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
