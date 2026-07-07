"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { findActiveMainNavId } from "@/data/navigation";

interface DashboardLayoutContextType {
  activeMainNavId: string;
  setActiveMainNavId: (id: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: (count: number) => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined);

export const DashboardLayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [activeMainNavId, setActiveMainNavId] = useState<string>("my-dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);

  // Sync active main navigation ID with the pathname on load/navigation
  useEffect(() => {
    if (pathname) {
      const activeId = findActiveMainNavId(pathname);
      setActiveMainNavId(activeId);
      // Close mobile sidebar on route change
      setIsMobileOpen(false);
    }
  }, [pathname]);

  return (
    <DashboardLayoutContext.Provider
      value={{
        activeMainNavId,
        setActiveMainNavId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileOpen,
        setIsMobileOpen,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
      }}
    >
      {children}
    </DashboardLayoutContext.Provider>
  );
};

export const useDashboardLayout = () => {
  const context = useContext(DashboardLayoutContext);
  if (!context) {
    throw new Error("useDashboardLayout must be used within a DashboardLayoutProvider");
  }
  return context;
};
