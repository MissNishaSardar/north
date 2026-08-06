import { Metadata } from "next";
import KanbanBoard from "@/components/KanbanBoard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your tasks and projects at a glance.",
};

const DashboardPage = () => {
  return (
    <main className="flex min-h-dvh flex-col gap-6 p-6">
      <KanbanBoard />
    </main>
  );
};

export default DashboardPage;