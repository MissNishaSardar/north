import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTaskByIdAction } from "@/server/task-actions";
import { TaskForm } from "@/components/Tasks/TaskForm";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shadcnui/card";

type EditTaskPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export const metadata: Metadata = {
  title: "Edit Task",
  description: "Edit task details",
};

const EditTaskPage = async ({ params }: EditTaskPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const { task, error } = await getTaskByIdAction(id);

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Link href="/tasks">
          <Button variant="ghost">
            <ArrowLeftIcon /> Back to Tasks
          </Button>
        </Link>
        <p className="text-muted-foreground text-lg">
          {error ?? "Task not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <Link href={`/tasks/${task.id}`}>
          <Button variant="ghost">
            <ArrowLeftIcon /> Back to Task
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Task</h1>
        <div className="w-24" />
      </div>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Edit &ldquo;{task.title}&rdquo;</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm task={task} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTaskPage;
