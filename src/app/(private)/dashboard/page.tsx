import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  LayoutDashboardIcon,
  UsersIcon,
  TrendingUpIcon,
  SettingsIcon,
  ActivityIcon,
  UserPlusIcon,
  LogInIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcnui/card";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your dashboard",
};

const sidebarLinks = [
  { label: "Dashboard", icon: LayoutDashboardIcon, active: true },
  { label: "Users", icon: UsersIcon, active: false },
  { label: "Analytics", icon: TrendingUpIcon, active: false },
  { label: "Settings", icon: SettingsIcon, active: false },
];

const stats = [
  { label: "Total Users", value: "2,450", icon: UsersIcon, trend: "+12%" },
  { label: "Active Sessions", value: "1,280", icon: ActivityIcon, trend: "+8%" },
  { label: "Revenue", value: "$48.2k", icon: CreditCardIcon, trend: "+23%" },
  { label: "Tasks Completed", value: "342", icon: CheckCircleIcon, trend: "+18%" },
] as const;

const recentActivity = [
  { action: "New user registered", time: "2 minutes ago", icon: UserPlusIcon },
  { action: "User session started", time: "15 minutes ago", icon: LogInIcon },
  { action: "Payment received", time: "1 hour ago", icon: CreditCardIcon },
  { action: "Task marked complete", time: "2 hours ago", icon: CheckCircleIcon },
  { action: "New user registered", time: "3 hours ago", icon: UserPlusIcon },
] as const;

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r p-6">
        <div className="mb-8 text-xl font-bold">North</div>
        <nav className="flex flex-col gap-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div
                key={link.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  link.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-4" />
                {link.label}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {session.user.name ?? session.user.email}!
            </p>
          </div>
          <SignOutButton />
        </header>

        <main className="flex-1 space-y-8 p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.trend} from last month</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {recentActivity.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
