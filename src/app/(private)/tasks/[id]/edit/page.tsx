import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTaskByIdAction } from "@/server/task-actions";
import { TaskForm } from "@/components/Tasks/TaskForm";
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
        <p className="text-muted-foreground text-lg">
          {error ?? "Task not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">Edit Task</h1>
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
