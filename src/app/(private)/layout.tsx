import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Navbar from "@/components/Layout/Navbar";
import { LayoutProps } from "@/lib/types";
import { auth } from "@/lib/auth";

const PrivateLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navbar user={session.user} />
      {children}
    </>
  );
};

export default PrivateLayout;
