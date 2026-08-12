"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { deleteAccount } from "@/actions/user";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/shadcnui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcnui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import {
  deleteAccountSchema,
  type deleteAccountType,
} from "@/lib/zodSchema";

const DeleteAccountDialog = ({ userName }: { userName: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<deleteAccountType>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "" },
    mode: "all",
  });

  const handleDelete = async (values: deleteAccountType) => {
    try {
      await deleteAccount(values);
      await authClient.signOut();
      router.replace("/sign-in");
    } catch (error) {
      toast.add({
        title: "Account deletion failed",
        type: "error",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <TrashIcon data-icon="inline-start" />
        Delete account
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            reset({ password: "" });
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes {userName}&apos;s account, sessions, and
              tasks. This cannot be undone. Enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(handleDelete)}
            noValidate
            className="flex flex-col gap-4">
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
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <TrashIcon data-icon="inline-start" />
                )}
                {isSubmitting ? "Deleting..." : "Delete account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteAccountDialog;
