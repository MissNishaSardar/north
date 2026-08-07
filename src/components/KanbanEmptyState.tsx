import { ClipboardListIcon } from "lucide-react";
import TaskDialog from "@/components/TaskDialog";

const KanbanEmptyState = () => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ClipboardListIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">No tasks yet</h2>
        <p className="text-sm text-muted-foreground">
          Create your first task to get started.
        </p>
      </div>
      <TaskDialog />
    </div>
  );
};

export default KanbanEmptyState;
