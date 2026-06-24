import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTaskAction, deleteTaskAction } from "@/server/actions/taskAction";
import { Metadata } from "next";
import { format } from "date-fns";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/shadcnui/button";

export const metadata: Metadata = {
  title: "Task",
  description: "Task details",
};

async function TaskDetailPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const task = await getTaskAction(params.id);
  if (!task) redirect("/tasks");

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/tasks"
        className="bg-card text-foreground ring-foreground/5 dark:ring-foreground/10 hover:bg-accent mb-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors">
        <ArrowLeft className="size-4" />
        Back to tasks
      </Link>

      <div className="bg-card ring-foreground/5 dark:ring-foreground/10 rounded-xl border p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                {task.priority.toUpperCase()}
              </span>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs capitalize">
                {task.status.replace("_", " ")}
              </span>
              {task.dueDate && (
                <span className="text-muted-foreground text-xs">
                  Due {format(new Date(task.dueDate), "PPP")}
                </span>
              )}
            </div>
          </div>

          <form action={deleteTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </form>
        </div>

        {task.description && (
          <p className="text-muted-foreground whitespace-pre-line">
            {task.description}
          </p>
        )}

        <p className="text-muted-foreground mt-6 text-xs">
          Created {format(new Date(task.createdAt), "PPP")}
        </p>
      </div>
    </section>
  );
}

export default TaskDetailPage;
