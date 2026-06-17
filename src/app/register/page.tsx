import Register from "@/components/Form/Register";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { UserPlus } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your account",
};

const page = () => {
  return (
    <section className="grid h-dvh place-items-center">
      <Card className="ring-foreground/5 dark:ring-foreground/10 relative w-full max-w-md ring-1 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-3xl ring-1">
            <UserPlus className="text-primary size-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription className="text-balance">
            Fill in the details below to get started.
          </CardDescription>
        </CardHeader>

        <Register />
      </Card>
    </section>
  );
};

export default page;
