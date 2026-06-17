import Login from "@/components/Form/Login";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { LogIn } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account",
};

const page = () => {
  return (
    <section className="grid h-dvh place-items-center">
      <div className="relative flex items-center justify-center p-4">
        {/* Decorative background gradient */}
        <div className="from-primary/5 via-accent/5 to-background pointer-events-none absolute inset-0 bg-linear-to-br" />

        <Card className="shadow-primary/5 ring-foreground/5 hover:shadow-primary/10 dark:ring-foreground/10 relative w-full max-w-md shadow-2xl ring-1 backdrop-blur-sm transition-shadow duration-300">
          <CardHeader className="text-center">
            <div className="bg-primary/10 ring-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-3xl ring-1">
              <LogIn className="text-primary size-6" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-balance">
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>

          <Login />
        </Card>
      </div>
    </section>
  );
};

export default page;
