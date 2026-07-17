import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTaskByIdAction } from "@/server/task-actions";
import { ArrowLeftIcon, CalendarIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { DeleteTaskButton } from "@/components/Tasks/DeleteTaskButton";

type TaskDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export const metadata: Metadata = {
  title: "Task Details",
  description: "View task details",
};

const statusStyles: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const priorityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const formatDate = (date: Date | null) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const TaskDetailPage = async ({ params }: TaskDetailPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const { task, error } = await getTaskByIdAction(id);

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Link href="/tasks">
          <Button variant="ghost">
            <ArrowLeftIcon /> Back to Tasks
          </Button>
        </Link>
        <p className="text-muted-foreground text-lg">
          {error ?? "Task not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <Link href="/tasks">
          <Button variant="ghost">
            <ArrowLeftIcon /> Back to Tasks
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/tasks/${task.id}/edit`}>
            <Button variant="outline">
              <PencilIcon /> Edit
            </Button>
          </Link>
          <DeleteTaskButton
            taskId={task.id}
            taskTitle={task.title}
            variant="outline"
          />
        </div>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    statusStyles[task.status] ?? ""
                  }`}>
                  {task.status.replace("_", " ")}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    priorityStyles[task.priority] ?? ""
                  }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {task.description && (
            <div>
              <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                Description
              </h3>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.dueDate && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4" />
              <span>Due {formatDate(task.dueDate)}</span>
            </div>
          )}

          <div className="text-muted-foreground border-t pt-4 text-xs">
            <p>Created {formatDate(task.createdAt)}</p>
            {task.updatedAt !== task.createdAt && (
              <p>Updated {formatDate(task.updatedAt)}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetailPage;
