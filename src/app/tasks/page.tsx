import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTasksAction, deleteTaskAction } from "@/server/actions/taskAction";
import { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/shadcnui/button";

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
  const sorted = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
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
            className="bg-card ring-foreground/5 dark:ring-foreground/10 flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-accent/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{task.priority.toUpperCase()}</span>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {task.status.replace("_", " ")}
                </span>
                {task.dueDate && (
                  <span className="text-muted-foreground text-xs">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <Link
                href={`/tasks/${task.id}`}
                className="hover:text-primary mt-1 block truncate text-lg font-medium underline-offset-4 hover:underline">
                {task.title}
              </Link>
              {task.description && (
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {task.description}
                </p>
              )}
            </div>

            <form action={deleteTaskAction} className="ml-4">
              <input type="hidden" name="id" value={task.id} />
              <Button variant="ghost" size="icon" type="submit">
                <Trash2 className="size-4" />
              </Button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TasksPage;
