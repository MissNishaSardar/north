"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { changeProfilePassword } from "@/actions/user";
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import {
  changePasswordSchema,
  type changePasswordType,
} from "@/lib/zodSchema";

const ChangePasswordForm = () => {
  const [success, setSuccess] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<changePasswordType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "all",
  });

  const onSubmit = async (values: changePasswordType) => {
    try {
      await changeProfilePassword(values);
      setSuccess(true);
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.add({ title: "Password changed", type: "success" });
    } catch (error) {
      setSuccess(false);
      toast.add({
        title: "Password change failed",
        type: "error",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {success && (
        <Alert>
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription>
            Other signed-in sessions have been revoked. Sign in again where needed.
          </AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Controller
          name="currentPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
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
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
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
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <KeyRoundIcon data-icon="inline-start" />
        )}
        {isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
