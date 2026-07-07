export interface SubNavigationItem {
  id: string;
  label: string;
  href: string;
  iconName: string; // Key corresponding to the icon component in Icons.tsx
}

export interface MainNavigationItem {
  id: string;
  label: string;
  subItems: SubNavigationItem[];
}

export const navigationConfig: MainNavigationItem[] = [
  {
    id: "site-control",
    label: "Site Control",
    subItems: [
      {
        id: "pages",
        label: "Pages",
        href: "/dashboard/pages",
        iconName: "files",
      },
      {
        id: "banners",
        label: "Banners",
        href: "/dashboard/banners",
        iconName: "image",
      },
      {
        id: "nav-settings",
        label: "Navigation",
        href: "/dashboard/navigation",
        iconName: "compass",
      },
      {
        id: "site-settings",
        label: "Settings",
        href: "/dashboard/settings",
        iconName: "sliders",
      },
    ],
  },
  // {
  //   id: "ecommerce",
  //   label: "eCommerce",
  //   subItems: [
  //     {
  //       id: "pages",
  //       label: "Pages",
  //       href: "/dashboard/pages",
  //       iconName: "files",
  //     },
  //     {
  //       id: "banners",
  //       label: "Banners",
  //       href: "/dashboard/banners",
  //       iconName: "image",
  //     },
  //     {
  //       id: "nav-settings",
  //       label: "Navigation",
  //       href: "/dashboard/navigation",
  //       iconName: "compass",
  //     },
  //     {
  //       id: "site-settings",
  //       label: "Settings",
  //       href: "/dashboard/settings",
  //       iconName: "sliders",
  //     },
  //   ],
  // },
  // ----
  // {
  //   id: "my-dashboard",
  //   label: "My Dashboard",
  //   subItems: [
  //     {
  //       id: "overview",
  //       label: "Overview",
  //       href: "/dashboard",
  //       iconName: "dashboard",
  //     },
  //     {
  //       id: "employees",
  //       label: "Employee Management",
  //       href: "/dashboard/users",
  //       iconName: "users",
  //     },
  //     {
  //       id: "analytics",
  //       label: "Analytics",
  //       href: "/dashboard/analytics",
  //       iconName: "barChart",
  //     },
  //     {
  //       id: "activity",
  //       label: "Activity Log",
  //       href: "/dashboard/activity",
  //       iconName: "activity",
  //     },
  //   ],
  // },
  {
    id: "my-dashboard",
    label: "MyDashboard",
    subItems: [
      {
        id: "overview",
        label: "Overview",
        href: "/dashboard",
        iconName: "dashboard",
      },
      {
        id: "resources",
        label: "Resources",
        href: "/dashboard/resources",
        iconName: "resources",
      },
      {
        id: "inspirations",
        label: "Inspirations",
        href: "/dashboard/inspirations",
        iconName: "inspirations",
      },
      {
        id: "tools",
        label: "Tools",
        href: "/dashboard/tools",
        iconName: "tools",
      },
      
      {
        id: "posts",
        label: "Posts",
        href: "/dashboard/posts",
        iconName: "posts",
      },
      {
        id: "ideas",
        label: "Ideas",
        href: "/dashboard/ideas",
        iconName: "ideas",
      },
      // {
      //   id: "learning-roadmap",
      //   label: "Learning Roadmap",
      //   href: "/dashboard/learning-roadmap",
      //   iconName: "learning-roadmap",
      // },
      
    ],
  },
  {
    id: "order-manage",
    label: "Order Manage",
    subItems: [
      {
        id: "orders",
        label: "Orders List",
        href: "/dashboard/orders",
        iconName: "shoppingBag",
      },
      {
        id: "shipments",
        label: "Shipments",
        href: "/dashboard/shipments",
        iconName: "truck",
      },
      {
        id: "invoices",
        label: "Invoices",
        href: "/dashboard/invoices",
        iconName: "receipt",
      },
    ],
  },
];

// Helper to find parent main nav from sub item pathname
export function findActiveMainNavId(pathname: string): string {
  for (const mainItem of navigationConfig) {
    if (mainItem.subItems.some((sub) => sub.href === pathname)) {
      return mainItem.id;
    }
  }
  // Default fallback if path starts with dashboard or users
  if (pathname.includes("/dashboard/users")) return "my-dashboard";
  return "my-dashboard"; // default to dashboard
}
