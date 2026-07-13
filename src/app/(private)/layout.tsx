import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Sidebar } from "../../components/Sidebar";

type PrivateLayoutProps = Readonly<{
  children: ReactNode;
}>;

const PrivateLayout = async ({ children }: PrivateLayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
};

export default PrivateLayout;
