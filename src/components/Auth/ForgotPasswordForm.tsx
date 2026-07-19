"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/zodSchema";
import Link from "next/link";
import { useState } from "react";
import { Loader2Icon, MailIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

const ForgotPasswordForm = () => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "all",
  });

  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }: ForgotPasswordSchema) => {
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message ?? error.code ?? "Failed to send reset email");
      } else {
        setSent(true);
        toast.success("If that email exists, a reset link has been sent.");
      }
    } catch {
      toast.error("Failed to send reset email");
    }
  };

  if (sent) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        If an account with that email exists, we&apos;ve sent a password reset link.
        Check your email (or server console in development).
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              aria-invalid={fieldState.invalid}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ?
          <>
            <Loader2Icon className="animate-spin" /> Sending...
          </>
        : <>
            <MailIcon /> Send reset link
          </>
        }
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};

export { ForgotPasswordForm };