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

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  Sidebar as ShadcnSidebar,
} from "@/components/shadcnui/sidebar";

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
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-3 py-2 text-xl font-bold">North</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active =
                  pathname.startsWith(link.href) && link.href !== "#";

                return (
                  <SidebarMenuItem key={link.label}>
                    <SidebarMenuButton
                      render={<Link href={link.href} />}
                      isActive={active}
                      tooltip={link.label}>
                      <Icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </ShadcnSidebar>
  );
};

export { Sidebar };
