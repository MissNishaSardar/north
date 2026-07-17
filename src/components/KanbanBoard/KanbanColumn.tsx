"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { KanbanCard } from "./KanbanCard";
import type { KanbanTask } from "./types";

type KanbanColumnProps = {
  id: string;
  label: string;
  icon: ReactNode;
  tasks: KanbanTask[];
};

const KanbanColumn = ({ id, label, icon, tasks }: KanbanColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-card/50"
      }`}>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="font-semibold">{label}</h3>
        <span className="text-muted-foreground ml-auto text-sm">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No tasks
          </p>
        )}
      </div>
    </div>
  );
};

export { KanbanColumn };
