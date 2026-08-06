import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

const SignInPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-muted-foreground text-sm">
        Authentication UI coming soon.
      </p>
      <Link href="/" className="text-sm underline-offset-4 hover:underline">
        Back to home
      </Link>
    </main>
  );
};

export default SignInPage;
