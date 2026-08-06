import { headers } from "next/headers";
import TaskDialog from "@/components/TaskDialog";
import DndWrapper from "@/components/DndWrapper";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import {
  BoardStatus,
  BoardTask,
  BOARD_STATUSES,
} from "@/lib/types";

const KanbanBoard = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });

  const columns = BOARD_STATUSES.reduce<Record<BoardStatus, BoardTask[]>>(
    (acc, status) => {
      acc[status] = tasks
        .filter((task) => task.status === status)
        .map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate?.toISOString() ?? null,
          order: task.order,
        }));
      return acc;
    },
    { TODO: [], IN_PROGRESS: [], DONE: [] }
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <TaskDialog />
      </div>
      <DndWrapper
        key={tasks.map((task) => `${task.id}:${task.order}:${task.status}`).join("|")}
        columns={columns}
      />
    </div>
  );
};

export default KanbanBoard;