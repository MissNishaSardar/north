import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getExpiredTasksAction } from "@/server/task-actions";
import { EyeIcon } from "lucide-react";
import { ExpiredTaskCard } from "@/components/Tasks/ExpiredTaskCard";

export const metadata: Metadata = {
  title: "Preview Task",
  description: "Expired and overdue tasks",
};

const PreviewTaskPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { tasks } = await getExpiredTasksAction();

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-3">
        <EyeIcon className="text-muted-foreground size-6" />
        <h1 className="text-2xl font-bold">Preview Task</h1>
      </div>

      {tasks.length === 0 ?
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-muted-foreground text-lg">No expired tasks</p>
          <Link href="/tasks">
            <span className="text-muted-foreground text-sm underline">
              Go to Tasks
            </span>
          </Link>
        </div>
      : <div className="grid gap-4">
          {tasks.map((task) => (
            <ExpiredTaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      }
    </div>
  );
};

export default PreviewTaskPage;
