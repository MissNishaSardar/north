import { Metadata } from "next";
import { headers } from "next/headers";
import SignOutButton from "@/components/Auth/SignOutButton";
import TaskDialog from "@/components/TaskDialog";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your tasks and projects at a glance.",
};

const DashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {session?.user.name}. Your tasks will appear here soon.
      </p>
      <TaskDialog />
      <SignOutButton />
    </main>
  );
};

export default DashboardPage;
