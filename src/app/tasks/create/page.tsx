import CreateTask from "@/components/Form/CreateTask";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import { ListTodo } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Task",
  description: "Define your task details and set a deadline.",
};

const CreateTaskPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <section className="grid h-dvh place-items-center">
      <Card className="ring-foreground/5 dark:ring-foreground/10 relative w-full max-w-md ring-1 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-3xl ring-1">
            <ListTodo className="text-primary size-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Create New Task
          </CardTitle>
          <CardDescription className="text-balance">
            Define your task details and set a deadline.
          </CardDescription>
        </CardHeader>

        <CreateTask />
      </Card>
    </section>
  );
};

export default CreateTaskPage;
