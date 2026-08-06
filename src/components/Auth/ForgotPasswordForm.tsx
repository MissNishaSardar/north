"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Spinner } from "@/components/shadcnui/spinner";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, forgotPasswordType } from "@/lib/zodSchema";

const ForgotPasswordForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<forgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "all",
  });

  const onSubmit = async (values: forgotPasswordType) => {
    setError(null);
    const { error: authError } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });

    if (authError) {
      setError(
        authError.message ?? "Unable to send reset link. Please try again.",
      );
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Alert>
        <CircleCheckIcon />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          If an account exists for that email, a password reset link has been
          sent. It expires shortly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
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
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <MailIcon data-icon="inline-start" />
        )}
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
