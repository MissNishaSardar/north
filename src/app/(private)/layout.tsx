import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import AppSidebar from "@/components/Layout/AppSidebar";
import Navbar from "@/components/Layout/Navbar";
import { SidebarProvider } from "@/components/shadcnui/sidebar";
import { LayoutProps } from "@/lib/types";
import { auth } from "@/lib/auth";

const PrivateLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const sidebarCookie = (await cookies()).get("sidebar_state");

  return (
    <SidebarProvider defaultOpen={sidebarCookie?.value !== "false"}>
      <AppSidebar user={session.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar user={session.user} />
        {children}
      </div>
    </SidebarProvider>
  );
};

export default PrivateLayout;
