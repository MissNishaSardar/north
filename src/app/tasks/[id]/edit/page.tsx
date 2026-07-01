import EditTask from "@/components/Form/EditTask";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import { getTaskAction } from "@/server/actions/taskAction";
import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { title: "Edit Task" };
  const task = await getTaskAction(id);
  if (!task) return { title: "Edit Task" };
  return {
    title: `Edit: ${task.title}`,
    description: `Editing task: ${task.title}`,
  };
}

const EditTaskPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");
  const task = await getTaskAction(id);
  if (!task) redirect("/tasks");
  return (
    <section className="grid h-dvh place-items-center">
      <Card className="ring-foreground/5 dark:ring-foreground/10 relative w-full max-w-md ring-1 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-3xl ring-1">
            <Pencil className="text-primary size-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Edit Task
          </CardTitle>
          <CardDescription className="text-balance">
            Update your task details and save changes.
          </CardDescription>
        </CardHeader>
        <EditTask
          task={{
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          }}
        />
      </Card>
    </section>
  );
};

export default EditTaskPage;
