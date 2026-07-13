import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTasksAction } from "@/server/task-actions";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";

export const metadata: Metadata = {
  title: "Tasks",
  description: "View all tasks",
};

const statusBadge: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const priorityBadge: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const formatDate = (date: Date | null) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const TasksPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { tasks } = await getTasksAction();

  return (
    <>
      <header className="flex items-center justify-between border-b px-8 py-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link href="/tasks/create">
          <Button>
            <PlusIcon /> New Task
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-8">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="text-lg text-muted-foreground">No tasks yet</p>
            <Link href="/tasks/create">
              <Button>
                <PlusIcon /> Create your first task
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{task.title}</span>
                  {task.description && (
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {task.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      statusBadge[task.status] ?? ""
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      priorityBadge[task.priority] ?? ""
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default TasksPage;
