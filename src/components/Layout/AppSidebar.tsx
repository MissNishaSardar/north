"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, ShieldCheckIcon, UserRoundIcon, type LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/shadcnui/sidebar";
import { cn } from "@/lib/utils";

type AppSidebarUser = {
  role?: string | null;
};

type NavItem = {
  title: string;
  url: Route;
  icon: LucideIcon;
};

const AppSidebar = ({ user }: { user: AppSidebarUser }) => {
  const pathname = usePathname();
  const { state } = useSidebar();

  const items: NavItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
    { title: "Profile", url: "/profile", icon: UserRoundIcon },
  ];

  if (user.role === "admin") {
    items.push({ title: "Admin", url: "/admin", icon: ShieldCheckIcon });
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md p-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-heading text-sm font-semibold text-sidebar-primary-foreground">
              N
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
              North
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={pathname === item.url}
                      tooltip={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarTrigger
        className={cn(
          "fixed top-3 z-50 hidden translate-x-1/2 transition-[left] duration-200 ease-linear md:inline-flex",
          state === "collapsed"
            ? "left-(--sidebar-width-icon)"
            : "left-(--sidebar-width)"
        )}
      />
    </>
  );
};

export default AppSidebar;
