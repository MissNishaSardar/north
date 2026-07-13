"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  ListTodoIcon,
  UsersIcon,
  TrendingUpIcon,
  SettingsIcon,
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", icon: LayoutDashboardIcon, href: "/dashboard" },
  { label: "Tasks", icon: ListTodoIcon, href: "/tasks" },
  { label: "Users", icon: UsersIcon, href: "#" },
  { label: "Analytics", icon: TrendingUpIcon, href: "#" },
  { label: "Settings", icon: SettingsIcon, href: "#" },
] as const;

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r p-6">
      <div className="mb-8 text-xl font-bold">North</div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href) && link.href !== "#";

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export { Sidebar };
