import { Button } from "@/components/shadcnui/button";
import { Separator } from "@/components/shadcnui/separator";
import { DeleteTaskButton } from "@/components/TaskActions/DeleteTaskButton";
import { TaskPriorityBadge, TaskStatusBadge } from "@/components/TaskBadges";
import { auth } from "@/lib/auth";
import { getTaskAction } from "@/server/actions/taskAction";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Pencil } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { title: "Task" };
  const task = await getTaskAction(id);
  if (!task) return { title: "Task" };
  return { title: task.title, description: task.description ?? "Task details" };
}

async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");
  const task = await getTaskAction(id);
  if (!task) redirect("/tasks");
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/tasks"
        className="bg-card text-foreground ring-foreground/5 dark:ring-foreground/10 hover:bg-accent mb-6 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors">
        <ArrowLeft className="size-4" />
        Back to tasks
      </Link>
      <div className="bg-card ring-foreground/5 dark:ring-foreground/10 rounded-xl border">
        <div className="flex flex-col gap-4 p-6 pb-0">
          <div className="flex flex-wrap items-center gap-2">
            <TaskPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
            {task.dueDate && (
              <span className="text-muted-foreground ml-auto inline-flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5" />
                Due {format(new Date(task.dueDate), "PPP")}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {task.title}
          </h1>
        </div>
        <Separator className="mt-6" />
        <div className="px-6 py-6">
          {task.description ?
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          : <p className="text-muted-foreground/50 italic">
              No description provided.
            </p>
          }
        </div>
        <Separator />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex flex-col gap-1 text-xs">
            <span>Created {format(new Date(task.createdAt), "PPP")}</span>
            <span>Updated {format(new Date(task.updatedAt), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2">
            <DeleteTaskButton taskId={task.id} />
            <Link href={`/tasks/${task.id}/edit`}>
              <Button
                variant="outline"
                size="sm">
                <Pencil className="size-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TaskDetailPage;
