import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateTaskForm } from "@/components/Tasks/CreateTaskForm";
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
    <>
      <header className="flex items-center border-b px-8 py-4">
        <h1 className="text-2xl font-bold">Create Task</h1>
      </header>

      <main className="flex-1 p-8">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTaskForm />
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default CreateTaskPage;
