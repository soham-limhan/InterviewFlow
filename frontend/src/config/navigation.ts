import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Brain,
  BarChart3,
  Settings,
  Shield,
  FileText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[];
  children?: NavItem[];
}

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["recruiter", "candidate", "admin"],
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: Briefcase,
    roles: ["recruiter", "candidate", "admin"],
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
    roles: ["recruiter", "admin"],
  },
  {
    title: "Interviews",
    href: "/interviews",
    icon: Calendar,
    roles: ["recruiter", "candidate", "admin"],
  },
  {
    title: "AI Tools",
    href: "/ai/questions",
    icon: Brain,
    roles: ["recruiter", "admin"],
    children: [
      {
        title: "Question Generator",
        href: "/ai/questions",
        icon: Brain,
      },
      {
        title: "AI Reports",
        href: "/ai/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["recruiter", "admin"],
  },
];

export const bottomNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["recruiter", "candidate", "admin"],
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Shield,
    roles: ["admin"],
  },
];
