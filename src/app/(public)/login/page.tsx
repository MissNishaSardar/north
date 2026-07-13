import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/Auth/LoginForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shadcnui/card";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
