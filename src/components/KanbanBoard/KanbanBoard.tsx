"use client";

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { toast } from "react-toastify";
import { updateTaskStatusAction } from "@/server/task-actions";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";
import type { KanbanTask } from "./types";
import {
  ClipboardListIcon,
  TimerIcon,
  CheckCircle2Icon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import Link from "next/link";

const columns = [
  {
    id: "todo",
    label: "To Do",
    icon: <ClipboardListIcon className="size-4" />,
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: <TimerIcon className="size-4" />,
  },
  {
    id: "done",
    label: "Done",
    icon: <CheckCircle2Icon className="size-4" />,
  },
] as const;

type KanbanBoardProps = {
  tasks: KanbanTask[];
};

const KanbanBoard = ({ tasks }: KanbanBoardProps) => {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const { refresh } = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const groupedTasks = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overColumnId = over.id as string;
    const validStatuses = ["todo", "in_progress", "done"];
    if (!validStatuses.includes(overColumnId)) return;

    const { error } = await updateTaskStatusAction(
      active.id as string,
      overColumnId,
    );
    if (error) {
      toast.error(error);
    } else {
      refresh();
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/tasks/create">
          <Button>
            <PlusIcon /> New Task
          </Button>
        </Link>
      </div>
      {mounted ?
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-3">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                icon={col.icon}
                tasks={groupedTasks[col.id]}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ?
              <KanbanCard
                task={activeTask}
                isDragOverlay
              />
            : null}
          </DragOverlay>
        </DndContext>
      : <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-3">
          {columns.map((col) => (
            <div
              key={col.id}
              className="border-border bg-card/50 flex flex-col gap-3 rounded-2xl border p-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{col.icon}</span>
                <h3 className="font-semibold">{col.label}</h3>
                <span className="text-muted-foreground ml-auto text-sm">
                  {groupedTasks[col.id].length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {groupedTasks[col.id].length === 0 && (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export { KanbanBoard };
