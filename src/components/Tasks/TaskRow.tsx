"use client";

import { useRouter } from "next/navigation";

type TaskRowTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
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
  if (!date) return "\u2014";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

type TaskRowProps = {
  task: TaskRowTask;
};

const TaskRow = ({ task }: TaskRowProps) => {
  const { push } = useRouter();

  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
      onClick={() => push(`/tasks/${task.id}`)}
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
    </div>
  );
};

export { TaskRow };
