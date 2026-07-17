"use client";

import { useDraggable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
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
};

const KanbanCard = ({ task, isDragOverlay }: KanbanCardProps) => {
  const { push } = useRouter();
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`bg-card focus-visible:ring-ring cursor-grab rounded-xl border p-3 text-sm shadow-sm transition-[box-shadow,opacity] focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md"
      } ${isDragOverlay ? "shadow-xl" : ""}`}>
      <div className="mb-2 font-medium">{task.title}</div>
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
