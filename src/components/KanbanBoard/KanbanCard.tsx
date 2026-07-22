"use client";

import { useDraggable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import { updateTaskStatusAction } from "@/server/task-actions";
import type { KanbanTask } from "./types";

const priorityBadge: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const formatDate = (date: Date | null) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

type KanbanCardProps = {
  task: KanbanTask;
  isDragOverlay?: boolean;
  showCompleteButton?: boolean;
};

const KanbanCard = ({
  task,
  isDragOverlay,
  showCompleteButton,
}: KanbanCardProps) => {
  const { push, refresh } = useRouter();
  const [completing, setCompleting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: isDragOverlay,
    });

  const style =
    transform ?
      { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const handleClick = () => {
    if (!isDragging) push(`/tasks/${task.id}`);
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleting(true);
    const { error } = await updateTaskStatusAction(task.id, "done");
    if (error) {
      toast.error(error);
    } else {
      toast.success("Task completed!");
      refresh();
    }
    setCompleting(false);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`bg-card focus-visible:ring-ring relative cursor-grab rounded-xl border p-3 text-sm shadow-sm transition-[box-shadow,opacity] focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md"
      } ${isDragOverlay ? "shadow-xl" : ""}`}>
      {showCompleteButton && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className="text-muted-foreground hover:text-primary active:text-primary absolute top-2 right-2 rounded-full p-1 transition-colors"
          title="Mark as done">
          {completing ?
            <LoaderCircleIcon className="size-4 animate-spin" />
          : <CheckCircle2Icon className="size-4" />}
        </button>
      )}
      <div className="mb-2 flex items-center gap-1.5 font-medium">
        {task.status === "done" && (
          <CheckCircle2Icon className="size-4 shrink-0 text-green-500" />
        )}
        <span className="truncate">{task.title}</span>
      </div>
      <div className="flex items-center gap-2">
        {task.priority && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityBadge[task.priority] ?? ""}`}>
            {task.priority}
          </span>
        )}
        {formatDate(task.dueDate) && (
          <span className="text-muted-foreground text-xs">
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
};

export { KanbanCard };
