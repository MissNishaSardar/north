import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/shadcnui/button";
import { ListTodoIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
  description:
    "North is a task management app to plan, track, and get things done.",
};

const page = () => {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <ListTodoIcon className="size-10 text-primary" />
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold">
          Get things done with North
        </h1>
        <p className="max-w-md text-muted-foreground">
          Plan, track, and manage your tasks in one place. Create your free
          account to get started.
        </p>
      </div>
      <div className="flex gap-3">
        <Button render={<Link href="/sign-up" />} nativeButton={false}>
          Get started
        </Button>
        <Button
          variant="outline"
          render={<Link href="/sign-in" />}
          nativeButton={false}>
          Sign in
        </Button>
      </div>
    </main>
  );
};

export default page;
