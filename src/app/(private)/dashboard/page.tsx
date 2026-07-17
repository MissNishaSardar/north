import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTasksAction } from "@/server/task-actions";
import { KanbanBoard } from "@/components/KanbanBoard/KanbanBoard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your dashboard",
};

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { tasks } = await getTasksAction();

  return <KanbanBoard tasks={tasks} />;
};

export default DashboardPage;
