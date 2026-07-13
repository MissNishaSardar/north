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

  return <>{children}</>;
};

export default PrivateLayout;
