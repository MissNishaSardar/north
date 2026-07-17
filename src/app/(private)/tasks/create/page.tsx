import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TaskForm } from "@/components/Tasks/TaskForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shadcnui/card";

export const metadata: Metadata = {
  title: "Create Task",
  description: "Create a new task",
};

const CreateTaskPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">Create Task</h1>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTaskPage;
