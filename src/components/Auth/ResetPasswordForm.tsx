"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "@/components/shadcnui/toast";
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
import { resetPasswordSchema, resetPasswordType } from "@/lib/zodSchema";

const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<resetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "all",
  });

  const onSubmit = async (values: resetPasswordType) => {
    setError(null);
    const { error: authError } = await authClient.resetPassword({
      newPassword: values.newPassword,
      token,
    });

    if (authError) {
      setError(
        authError.message ??
          "Unable to reset password. The link may have expired.",
      );
      return;
    }

    toast.add({
      title: "Password updated",
      type: "success",
      description: "You can now sign in with your new password.",
    });
    router.push("/sign-in");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>New password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Reset failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <KeyRoundIcon data-icon="inline-start" />
        )}
        {isSubmitting ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
