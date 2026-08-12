"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import TaskDialog from "@/components/TaskDialog";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { cn } from "@/lib/utils";
import { BoardTask } from "@/lib/types";

const priorityIcon = {
  HIGH: { icon: ArrowUpIcon, className: "text-destructive" },
  MEDIUM: { icon: MinusIcon, className: "text-priority-medium" },
  LOW: { icon: ArrowDownIcon, className: "text-muted-foreground" },
} as const;

const stopPropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const DUE_SOON_DAYS = 3;

const TaskCard = ({
  task,
  onDelete,
}: {
  task: BoardTask;
  onDelete: (id: string) => Promise<void>;
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isDone = task.status === "DONE";
  const isOverdue = dueDate !== null && !isDone && dueDate < startOfToday();

  const dueSoonEnd = startOfToday();
  dueSoonEnd.setDate(dueSoonEnd.getDate() + DUE_SOON_DAYS);

  const isDueSoon =
    dueDate !== null && !isDone && !isOverdue && dueDate <= dueSoonEnd;

  const { icon: PriorityIcon, className: priorityClass } =
    priorityIcon[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex cursor-grab touch-none flex-col gap-2 rounded-lg border bg-card p-3 shadow-xs outline-none active:cursor-grabbing select-none",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium break-words text-sm">{task.title}</p>
        <div className="flex shrink-0 items-center gap-1">
          <TaskDialog
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              dueDate: task.dueDate,
            }}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Edit task"
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                onPointerDown={stopPropagation}
                onClick={stopPropagation}
              >
                <PencilIcon />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete task"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            onPointerDown={stopPropagation}
            onClick={(event) => {
              stopPropagation(event);
              void onDelete(task.id);
            }}
          >
            <TrashIcon className="text-destructive" />
          </Button>
        </div>
      </div>
      {task.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground break-words">
          {task.description}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-1",
            priorityClass
          )}
        >
          <PriorityIcon className="size-3.5" />
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        {dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              isOverdue && "text-destructive"
            )}
          >
            <CalendarIcon className="size-3.5" />
            {dueDate.toLocaleDateString()}
          </span>
        )}
      </div>
      {(isOverdue || isDueSoon) && (
        <div className="flex items-center gap-2">
          {isOverdue && (
            <Badge variant="destructive">
              Overdue
            </Badge>
          )}
          {isDueSoon && (
            <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-400">
              Due soon
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export { TaskCard };