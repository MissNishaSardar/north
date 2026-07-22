"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  CalendarPlusIcon,
  XCircleIcon,
  CheckIcon,
  CalendarIcon,
  LoaderCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { Calendar } from "@/components/shadcnui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcnui/popover";
import {
  extendTaskDueDateAction,
  cancelTaskAction,
  dismissOverdueTaskAction,
  updateTaskStatusAction,
} from "@/server/task-actions";

type ExpiredTaskCardTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
};

type ExpiredTaskCardProps = {
  task: ExpiredTaskCardTask;
};

const formatDate = (date: Date | null) => {
  if (!date) return "\u2014";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const priorityBadge: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const ExpiredTaskCard = ({ task }: ExpiredTaskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const { refresh } = useRouter();

  const handleExtend = async (days: number) => {
    setSubmitting(true);
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    const { error } = await extendTaskDueDateAction(task.id, newDate);
    setShowExtend(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Extended by ${days} day${days > 1 ? "s" : ""}`);
      refresh();
    }
    setSubmitting(false);
  };

  const handleExtendCustom = async (date: Date | undefined) => {
    if (!date) return;
    setSubmitting(true);
    const { error } = await extendTaskDueDateAction(task.id, date);
    setCustomDateOpen(false);
    setShowExtend(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Deadline extended");
      refresh();
    }
    setSubmitting(false);
  };

  const handleComplete = async () => {
    setSubmitting(true);
    const { error } = await updateTaskStatusAction(task.id, "done");
    if (error) {
      toast.error(error);
    } else {
      toast.success("Task completed!");
      refresh();
    }
    setSubmitting(false);
  };

  const handleCancel = async () => {
    setSubmitting(true);
    const { error } = await cancelTaskAction(task.id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Task cancelled");
      refresh();
    }
    setSubmitting(false);
  };

  const handleDismiss = async () => {
    setSubmitting(true);
    const { error } = await dismissOverdueTaskAction(task.id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Dismissed");
      refresh();
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900">
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={() => setExpanded((o) => !o)}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-4 shrink-0 text-red-500" />
            <span className="font-medium">{task.title}</span>
          </div>
          {task.description && (
            <span className="text-muted-foreground line-clamp-1 text-sm">
              {task.description}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm text-red-500">
            Due {formatDate(task.dueDate)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              priorityBadge[task.priority] ?? ""
            }`}>
            {task.priority}
          </span>
          <ChevronDownIcon
            className={`text-muted-foreground size-4 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-red-200 px-4 py-4 dark:border-red-900">
          <p className="text-muted-foreground text-sm">
            This task has expired. What would you like to do?
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() => setShowExtend((o) => !o)}>
                {submitting ?
                  <LoaderCircleIcon className="size-4 animate-spin" />
                : <CalendarPlusIcon className="size-4" />}
                Extend deadline
                <ChevronDownIcon
                  className={`size-3 transition-transform ${
                    showExtend ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {showExtend && (
                <div className="bg-background absolute top-full left-0 z-10 mt-1 flex gap-1 rounded-lg border p-2 shadow-sm">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleExtend(1)}>
                    +1 day
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleExtend(3)}>
                    +3 days
                  </Button>
                  <Popover
                    open={customDateOpen}
                    onOpenChange={setCustomDateOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={submitting}>
                          <CalendarIcon className="size-3" />
                          Custom
                        </Button>
                      }
                    />
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        onSelect={handleExtendCustom}
                        disabled={(d) =>
                          d < new Date(new Date().toDateString())
                        }
                        captionLayout="dropdown"
                        startMonth={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              disabled={submitting}
              onClick={handleComplete}>
              {submitting ?
                <LoaderCircleIcon className="size-4 animate-spin" />
              : <CheckCircle2Icon className="size-4" />}
              Mark as done
            </Button>

            <Button
              variant="destructive"
              size="sm"
              disabled={submitting}
              onClick={handleCancel}>
              {submitting ?
                <LoaderCircleIcon className="size-4 animate-spin" />
              : <XCircleIcon className="size-4" />}
              Mark as cancelled
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={submitting}
              onClick={handleDismiss}>
              {submitting ?
                <LoaderCircleIcon className="size-4 animate-spin" />
              : <CheckIcon className="size-4" />}
              Keep as overdue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { ExpiredTaskCard };
