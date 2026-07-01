import { Badge } from "@/components/shadcnui/badge";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

const priorityConfig: Record<
  string,
  { label: string; icon: typeof ArrowUp; className: string }
> = {
  high: {
    label: "High",
    icon: ArrowUp,
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  medium: {
    label: "Medium",
    icon: ArrowRight,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  low: {
    label: "Low",
    icon: ArrowDown,
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  },
};

function TaskPriorityBadge({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  const config = priorityConfig[priority] ?? priorityConfig.medium;
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, className)}>
      <Icon className="size-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

export { TaskPriorityBadge };