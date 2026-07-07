"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardLayout } from "./DashboardLayoutContext";
import { navigationConfig } from "@/data/navigation";
import { Icon } from "./Icons";
import { signOut } from "@/auth/services/authService";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeMainNavId,
    setActiveMainNavId,
    setIsMobileOpen,
    isMobileOpen,
    unreadNotificationsCount,
  } = useDashboardLayout();

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-[#e4d7d0] px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
      {/* Left Side: Logo & Main Navigation (Desktop) */}
      <div className="flex items-center gap-8">
        {/* Mobile: Hamburger Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-md text-brand-dark hover:bg-brand-bg/50 transition-colors md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <Icon name={isMobileOpen ? "x" : "menu"} size={22} />
        </button>

        {/* Brand Text Logo */}
        <Link
          href="/dashboard"
          className="font-serif text-2xl font-bold tracking-tight text-brand-dark hover:opacity-90 transition-opacity"
        >
          reem<span className="text-brand-main2">.N</span>
        </Link>

        {/* Desktop Main Navigation Links */}
        <div className="hidden md:flex items-center gap-1 font-sans text-sm font-medium">
          {navigationConfig.map((item) => {
            const isActive = activeMainNavId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMainNavId(item.id);
                  // If there is a first sub-item, navigate to it
                  if (item.subItems.length > 0) {
                    router.push(item.subItems[0].href);
                  }
                }}
                className={`px-4 py-2 rounded-default transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brand-bg text-brand-dark font-semibold shadow-sm"
                    : "text-gray-500 hover:text-brand-dark hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Side: Action Utilities (Desktop only) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Notifications Icon with unread badge */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 text-gray-500 hover:text-brand-dark hover:bg-brand-bg/30 rounded-full transition-all duration-200"
          aria-label="Notifications"
        >
          <Icon name="bell" size={20} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-main2 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Settings Icon */}
        <Link
          href="/dashboard/settings"
          className="p-2 text-gray-500 hover:text-brand-dark hover:bg-brand-bg/30 rounded-full transition-all duration-200"
          aria-label="Settings"
        >
          <Icon name="settings" size={20} />
        </Link>

        {/* Employee Management Button */}
        <Link
          href="/dashboard/users"
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-default border transition-all duration-200 ${
            pathname.startsWith("/dashboard/users")
              ? "bg-brand-main2 text-white border-brand-main2 shadow-sm"
              : "border-[#e4d7d0] text-gray-600 hover:border-brand-main2 hover:text-brand-main2 bg-white"
          }`}
        >
          <Icon name="users" size={15} />
          Employee Management
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-default text-brand-main2 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
        >
          <Icon name="logout" size={15} />
          Logout
        </button>
      </div>

      {/* Mobile Badge indicator (Optional right side mobile shortcut) */}
      <div className="flex md:hidden items-center gap-2">
        <Link
          href="/dashboard/notifications"
          className="relative p-1.5 text-gray-500 hover:text-brand-dark rounded-full"
        >
          <Icon name="bell" size={20} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-main2 text-[8px] font-bold text-white ring-1 ring-white">
              {unreadNotificationsCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
