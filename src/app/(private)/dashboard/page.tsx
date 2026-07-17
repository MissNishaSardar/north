import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import {
  ActivityIcon,
  CheckCircleIcon,
  CreditCardIcon,
  LogInIcon,
  UserPlusIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your dashboard",
};

const stats = [
  { label: "Total Users", value: "2,450", icon: ActivityIcon, trend: "+12%" },
  {
    label: "Active Sessions",
    value: "1,280",
    icon: ActivityIcon,
    trend: "+8%",
  },
  { label: "Revenue", value: "$48.2k", icon: CreditCardIcon, trend: "+23%" },
  {
    label: "Tasks Completed",
    value: "342",
    icon: CheckCircleIcon,
    trend: "+18%",
  },
] as const;

const recentActivity = [
  { action: "New user registered", time: "2 minutes ago", icon: UserPlusIcon },
  { action: "User session started", time: "15 minutes ago", icon: LogInIcon },
  { action: "Payment received", time: "1 hour ago", icon: CreditCardIcon },
  {
    action: "Task marked complete",
    time: "2 hours ago",
    icon: CheckCircleIcon,
  },
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
    <div className="space-y-8 p-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-muted-foreground text-xs">
                  {stat.trend} from last month
                </p>
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
                <li
                  key={index}
                  className="flex items-center gap-3">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                    <Icon className="text-muted-foreground size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-muted-foreground text-xs">{item.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
