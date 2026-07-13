import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shadcnui/card";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

const RegisterPage = async () => {
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
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
