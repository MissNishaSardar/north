"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "@/components/TaskCard";
import { cn } from "@/lib/utils";
import {
  BoardStatus,
  BoardTask,
  BOARD_STATUS_LABEL,
} from "@/lib/types";

const KanbanColumn = ({
  status,
  tasks,
  onDelete,
}: {
  status: BoardStatus;
  tasks: BoardTask[];
  onDelete: (id: string) => Promise<void>;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", column: status },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span
          className={cn(
            "size-2 rounded-full",
            status === "TODO" && "bg-muted-foreground",
            status === "IN_PROGRESS" && "bg-primary",
            status === "DONE" && "bg-success"
          )}
        />
        <h2 className="text-sm font-medium">{BOARD_STATUS_LABEL[status]}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          data-over={isOver}
          className={cn(
            "flex min-h-40 flex-col gap-2 rounded-xl border border-dashed p-3 transition-colors",
            isOver
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-muted/30"
          )}
        >
          {tasks.length === 0 ? (
            <p className="m-auto text-sm text-muted-foreground">
              Drop tasks here
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDelete} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export { KanbanColumn };