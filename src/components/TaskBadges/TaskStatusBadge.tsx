import { Badge } from "@/components/shadcnui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Play } from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  in_progress: {
    label: "In Progress",
    icon: Play,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  },
};

function TaskStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, className)}>
      <Icon className="size-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

export { TaskStatusBadge };