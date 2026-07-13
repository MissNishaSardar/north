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
      <>
        <header className="flex items-center border-b px-8 py-4">
          <Link href="/tasks">
            <Button variant="ghost">
              <ArrowLeftIcon /> Back to Tasks
            </Button>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">{error ?? "Task not found"}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="flex items-center border-b px-8 py-4">
        <h1 className="text-2xl font-bold">Edit Task</h1>
      </header>

      <main className="flex-1 p-8">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Edit &ldquo;{task.title}&rdquo;</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm task={task} />
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default EditTaskPage;
