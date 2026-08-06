import { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcnui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your North account.",
};

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Invalid link</AlertTitle>
              <AlertDescription>
                This password reset link is missing its token. Request a new
                one below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Request a new reset link
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
};

export default ResetPasswordPage;
