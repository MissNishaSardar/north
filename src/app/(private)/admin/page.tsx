import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminUserTable from "@/components/AdminUserTable";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage users, roles, and bans.",
};

const AdminPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const { users } = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100 },
  });

  return (
    <main className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage roles and bans across the workspace.
        </p>
      </div>
      <AdminUserTable users={users} currentUserId={session.user.id} />
    </main>
  );
};

export default AdminPage;
