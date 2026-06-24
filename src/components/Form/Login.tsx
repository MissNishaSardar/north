"use client";

import { Button } from "@/components/shadcnui/button";
import { CardContent, CardFooter } from "@/components/shadcnui/card";
import { Checkbox } from "@/components/shadcnui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Separator } from "@/components/shadcnui/separator";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "all",
  });

  const onSubmit = async (values: LoginType) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (error) {
      toast.error(
        error.message ?? error.statusText ?? "Invalid email or password.",
      );
      return;
    }

    toast.success("Welcome back!");
    router.push("/tasks/create");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate>
      <CardContent className="flex flex-col gap-6 pb-6">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="pl-9"
                    aria-invalid={fieldState.invalid}
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-9 pl-9"
                    aria-invalid={fieldState.invalid}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}>
                    {showPassword ?
                      <EyeOff className="size-4" />
                    : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <div className="flex items-center justify-between">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                data-invalid={fieldState.invalid}>
                <Checkbox
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldContent>
                  <FieldLabel
                    htmlFor={field.name}
                    className="cursor-pointer font-normal">
                    Remember me
                  </FieldLabel>
                </FieldContent>
              </Field>
            )}
          />

          <span className="text-muted-foreground w-full text-end text-sm">
            Forgot password?
          </span>
        </div>
      </CardContent>

      <Separator className="mb-6" />

      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}>
          {isSubmitting ?
            <Loader2 className="size-4 animate-spin" />
          : <LogIn className="size-4" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default Login;
