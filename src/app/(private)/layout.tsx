import ThemeToggleButton from "@/components/Buttons/ThemeToggleButton";
import ProfileDropdown from "@/components/Profile/ProfileDropdown";
import { Sidebar } from "@/components/Sidebar";
import { Separator } from "@/components/shadcnui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/shadcnui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

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
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggleButton />
            <ProfileDropdown avatarSrc={session.user.image} />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateLayout;
