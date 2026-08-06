import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { LayoutProps } from "@/lib/types";
import { auth } from "@/lib/auth";

const PrivateLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return <>{children}</>;
};

export default PrivateLayout;
