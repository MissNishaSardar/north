"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteTask, updateTaskOrder } from "@/actions/task";
import { KanbanColumn } from "@/components/KanbanColumn";
import { toast } from "@/components/shadcnui/toast";
import {
  BoardStatus,
  BoardTask,
  BOARD_STATUSES,
} from "@/lib/types";

type Columns = Record<BoardStatus, BoardTask[]>;

const DndWrapper = ({
  columns: initial,
}: {
  columns: Columns;
}) => {
  const [columns, setColumns] = React.useState<Columns>(initial);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findColumnFor = (id: string): BoardStatus | null => {
    for (const status of BOARD_STATUSES) {
      if (columns[status].some((task) => task.id === id)) {
        return status;
      }
    }
    return null;
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overIsColumn =
      (over.data.current as { type?: string } | undefined)?.type === "column";
    const activeColumn = findColumnFor(activeId);
    const overId = String(over.id);
    const overColumn = overIsColumn
      ? (overId as BoardStatus)
      : findColumnFor(overId);

    if (!activeColumn || !overColumn || overColumn === activeColumn) {
      return;
    }

    setColumns((prev) => {
      const task = prev[activeColumn].find((t) => t.id === activeId);
      if (!task) {
        return prev;
      }

      const target = prev[overColumn];
      const overIndex = overIsColumn
        ? target.length
        : target.findIndex((t) => t.id === overId);

      return {
        ...prev,
        [activeColumn]: prev[activeColumn].filter((t) => t.id !== activeId),
        [overColumn]: [
          ...target.slice(0, overIndex),
          task,
          ...target.slice(overIndex),
        ],
      };
    });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    const activeId = String(active.id);

    if (!over || active.id === over.id) {
      return;
    }

    const overIsColumn =
      (over.data.current as { type?: string } | undefined)?.type === "column";
    const overColumn = overIsColumn
      ? (String(over.id) as BoardStatus)
      : findColumnFor(String(over.id));

    if (!overColumn) {
      return;
    }

    const withoutActive = columns[overColumn].filter(
      (task) => task.id !== activeId
    );
    let index: number;

    if (overIsColumn) {
      index = withoutActive.length;
    } else {
      const foundIndex = withoutActive.findIndex(
        (task) => task.id === String(over.id)
      );
      index = foundIndex === -1 ? withoutActive.length : foundIndex;
    }

    setColumns((prev) => {
      const task = prev[overColumn].find((t) => t.id === activeId);
      if (!task) {
        return prev;
      }

      const list = prev[overColumn].filter((t) => t.id !== activeId);

      return {
        ...prev,
        [overColumn]: [
          ...list.slice(0, index),
          task,
          ...list.slice(index),
        ],
      };
    });

    try {
      await updateTaskOrder(activeId, overColumn, index);
    } catch (error) {
      toast.add({
        title: "Failed to move task",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    const column = findColumnFor(id);

    try {
      await deleteTask(id);
      toast.add({ title: "Task deleted", type: "success" });

      if (column) {
        setColumns((prev) => ({
          ...prev,
          [column]: prev[column].filter((task) => task.id !== id),
        }));
      }
    } catch (error) {
      toast.add({
        title: "Failed to delete task",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {BOARD_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columns[status]}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default DndWrapper;