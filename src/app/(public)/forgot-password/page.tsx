import { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your North account.",
};

const ForgotPasswordPage = () => {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
};

export default ForgotPasswordPage;
