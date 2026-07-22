import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCompletedTasksAction } from "@/server/task-actions";
import { HistoryIcon } from "lucide-react";
import { TaskRow } from "@/components/Tasks/TaskRow";

export const metadata: Metadata = {
  title: "Task History",
  description: "Completed and dismissed tasks",
};

const TaskHistoryPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { tasks } = await getCompletedTasksAction();

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-3">
        <HistoryIcon className="text-muted-foreground size-6" />
        <h1 className="text-2xl font-bold">Task History</h1>
      </div>

      {tasks.length === 0 ?
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-muted-foreground text-lg">No history yet</p>
          <Link href="/tasks">
            <span className="text-muted-foreground text-sm underline">
              Go to Tasks
            </span>
          </Link>
        </div>
      : <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
            />
          ))}
        </div>
      }
    </div>
  );
};

export default TaskHistoryPage;
