"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useFilePicker } from "use-file-picker";
import { uploadAvatar, updateProfileName } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcnui/avatar";
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
import { profileSchema, type profileType } from "@/lib/zodSchema";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ProfileDetailsForm = ({
  user,
}: {
  user: { name: string; image?: string | null };
}) => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty },
  } = useForm<profileType>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
    mode: "all",
  });

  const { openFilePicker } = useFilePicker({
    accept: "image/*",
    multiple: false,
    readFilesContent: false,
    onFilesSelected: async ({ plainFiles }) => {
      const file = plainFiles?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.add({
          title: "Invalid file",
          type: "error",
          description: "Please choose an image file.",
        });
        return;
      }

      if (file.size > MAX_AVATAR_SIZE) {
        toast.add({
          title: "Image too large",
          type: "error",
          description: "Maximum size is 5MB.",
        });
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        await uploadAvatar(formData);
        toast.add({ title: "Avatar updated", type: "success" });
        router.refresh();
      } catch (error) {
        toast.add({
          title: "Upload failed",
          type: "error",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        setUploading(false);
      }
    },
  });

  const onSubmit = async (values: profileType) => {
    try {
      await updateProfileName(values.name);
      toast.add({ title: "Profile updated", type: "success" });
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Update failed",
        type: "error",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={uploading}
          aria-label="Change avatar"
          className="group relative rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {uploading ? (
              <Spinner className="size-5" />
            ) : (
              <CameraIcon className="size-5" />
            )}
          </span>
        </button>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFilePicker}
            disabled={uploading}>
            {uploading ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <CameraIcon data-icon="inline-start" />
            )}
            {uploading ? "Uploading." : "Change avatar"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG or PNG, up to 5MB. Cropped to a square.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit" disabled={isSubmitting || !isDirty} className="self-start">
          {isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
};

export default ProfileDetailsForm;
