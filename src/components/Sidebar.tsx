"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  ListTodoIcon,
  UsersIcon,
  TrendingUpIcon,
  SettingsIcon,
  ChevronRightIcon,
  HistoryIcon,
  EyeIcon,
} from "lucide-react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  Sidebar as ShadcnSidebar,
} from "@/components/shadcnui/sidebar";

const navLinks = [
  { label: "Dashboard", icon: LayoutDashboardIcon, href: "/dashboard" },
  {
    label: "Tasks",
    icon: ListTodoIcon,
    href: "/tasks",
    subItems: [
      { label: "Task History", icon: HistoryIcon, href: "/tasks/history" },
      { label: "Preview Task", icon: EyeIcon, href: "/tasks/preview" },
    ],
  },
  { label: "Users", icon: UsersIcon, href: "#" },
  { label: "Analytics", icon: TrendingUpIcon, href: "#" },
  { label: "Settings", icon: SettingsIcon, href: "#" },
] as const;

const Sidebar = () => {
  const pathname = usePathname();
  const isOnTasks = pathname.startsWith("/tasks");
  const [tasksOpen, setTasksOpen] = useState(isOnTasks);

  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-0">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold group-data-[collapsible=icon]:size-8">
            N
          </div>
          <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">
            North
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active =
                  pathname.startsWith(link.href) && link.href !== "#";
                const isTasks = link.label === "Tasks";

                if (!isTasks) {
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
                }

                return (
                  <SidebarMenuItem key={link.label}>
                    <SidebarMenuButton
                      render={<Link href={link.href} />}
                      isActive={active}
                      tooltip={link.label}>
                      <Icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      showOnHover={false}
                      onClick={() => setTasksOpen((o) => !o)}
                      data-expanded={tasksOpen}>
                      <ChevronRightIcon
                        className="transition-transform duration-200"
                        style={{
                          transform:
                            tasksOpen ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                      />
                    </SidebarMenuAction>
                    {tasksOpen && (
                      <SidebarMenuSub>
                        {link.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          const subActive = pathname === sub.href;
                          return (
                            <SidebarMenuSubItem key={sub.label}>
                              <SidebarMenuSubButton
                                render={<Link href={sub.href} />}
                                isActive={subActive}>
                                <SubIcon />
                                <span>{sub.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
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
