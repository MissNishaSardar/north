import { TaskPriorityBadge, TaskStatusBadge } from "@/components/TaskBadges";
import { auth } from "@/lib/auth";
import { getTasksAction } from "@/server/actions/taskAction";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Tasks",
  description: "View and manage your tasks",
};

async function TasksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const tasks = await getTasksAction();

  if (!Array.isArray(tasks) || tasks.length === 0) {
    redirect("/tasks/create");
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">My Tasks</h1>
        <Link
          href="/tasks/create"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors">
          New Task
        </Link>
      </div>

      <div className="grid gap-4">
        {sorted.map((task) => (
          <div
            key={task.id}
            className="bg-card ring-foreground/5 dark:ring-foreground/10 hover:bg-accent/50 rounded-xl border transition-colors">
            <Link
              href={`/tasks/${task.id}`}
              className="flex flex-col gap-3 p-4">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <TaskPriorityBadge priority={task.priority} />
                <TaskStatusBadge status={task.status} />
                {task.dueDate && (
                  <span className="text-muted-foreground ml-auto inline-flex items-center gap-1 text-xs">
                    <Calendar className="size-3" />
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>

              {/* Title */}
              <span className="hover:text-primary text-lg font-medium underline-offset-4 hover:underline">
                {task.title}
              </span>

              {/* Description preview */}
              {task.description && (
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {task.description}
                </p>
              )}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TasksPage;
