"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/zodSchema";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

const ResetPasswordForm = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "all",
  });

  const onSubmit = async ({ password }: ResetPasswordSchema) => {
    if (!token) {
      toast.error("Invalid or missing reset link. Please request a new one.");
      return;
    }

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        toast.error(error.message ?? error.code ?? "Password reset failed");
      } else {
        toast.success("Password reset successfully! Please sign in.");
        replace("/login");
      }
    } catch {
      toast.error("Password reset failed");
    }
  };

  if (!token) {
    return (
      <div className="text-center text-sm text-destructive">
        Invalid or missing reset link. Please request a new one.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder="Enter new password"
              autoComplete="new-password"
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
            <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder="Confirm new password"
              autoComplete="new-password"
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
            <Loader2Icon className="animate-spin" /> Resetting...
          </>
        : <>
            <ShieldCheckIcon /> Reset password
          </>
        }
      </Button>
    </form>
  );
};

export { ResetPasswordForm };