import {
  BarChart3,
  Users,
  Settings,
  Plus,
  Bell,
  Search,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  UserCheck,
  Shield,
  Database,
  Mail,
  Calendar,
} from "lucide-react";
import type { ComponentType } from "react";

export interface NavigationItemType {
  id: string;
  name: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  color?: string;
  badge?: string;
  children?: NavigationItemType[];
  isExpanded?: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItemType[];
}

export const navigationConfig: NavigationSection[] = [
  {
    id: "main",
    title: "Main Navigation",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        color: "text-blue-600",
      },
      {
        id: "users",
        name: "User Management",
        href: "/users",
        icon: Users,
        color: "text-purple-600",
      },
    ],
  },
];

export const quickActions = [
  {
    name: "Notifications",
    icon: Bell,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    name: "Search",
    icon: Search,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    name: "Add New",
    icon: Plus,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];
