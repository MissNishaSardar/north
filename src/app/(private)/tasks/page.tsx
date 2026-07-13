import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTasksAction } from "@/server/task-actions";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { TaskRow } from "@/components/Tasks/TaskRow";

export const metadata: Metadata = {
  title: "Tasks",
  description: "View all tasks",
};

const TasksPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { tasks } = await getTasksAction();

  return (
    <>
      <header className="flex items-center justify-between border-b px-8 py-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link href="/tasks/create">
          <Button>
            <PlusIcon /> New Task
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-8">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="text-lg text-muted-foreground">No tasks yet</p>
            <Link href="/tasks/create">
              <Button>
                <PlusIcon /> Create your first task
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default TasksPage;
