"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterSchema } from "@/lib/zodSchema";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2Icon, UserIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

const RegisterForm = () => {
  const { replace } = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "all",
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const { error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message ?? error.code ?? "Registration failed. Please try again.");
      } else {
        toast.success("Account created successfully!");
        reset();
        replace("/dashboard");
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6"
      noValidate
    >
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Enter your name"
              autoComplete="name"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder="Create a password"
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
              placeholder="Confirm your password"
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
            <Loader2Icon className="animate-spin" /> Creating account...
          </>
        : <>
            <UserIcon /> Create account
          </>
        }
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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

export { RegisterForm };
