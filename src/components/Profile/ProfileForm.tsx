"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { updateProfileAction } from "@/server/profile-actions";
import { updateProfileSchema, type UpdateProfileSchema } from "@/lib/zodSchema";
import { useRouter } from "next/navigation";
import { Loader2Icon, SaveIcon, PhoneIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel, FieldContent } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Textarea } from "@/components/shadcnui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import { countryCodes } from "@/components/Profile/countries";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
] as const;

const toDateString = (date: Date | null | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    phone: number | null;
    countryCode: string | null;
    hobby: string | null;
    gender: string | null;
    education: string | null;
    dateOfBirth: Date | null;
    location: string | null;
    createdAt: Date;
  };
};

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { push } = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? "",
      bio: user.bio ?? "",
      phone: user.phone?.toString() ?? "",
      countryCode: user.countryCode ?? "91",
      hobby: user.hobby ?? "",
      gender: (user.gender as UpdateProfileSchema["gender"]) ?? "",
      education: user.education ?? "",
      dateOfBirth: toDateString(user.dateOfBirth),
      location: user.location ?? "",
    },
    mode: "all",
  });

  const onSubmit = async (data: UpdateProfileSchema) => {
    try {
      const { error } = await updateProfileAction(data);

      if (error) {
        toast.error(error);
      } else {
        toast.success("Profile updated!");
        push("/profile");
      }
    } catch {
      toast.error("Failed to update profile.");
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
              placeholder="Your name"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="bio"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Tell us about yourself"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field>
        <FieldLabel>Phone</FieldLabel>
        <div className="flex gap-2">
          <Controller
            name="countryCode"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-40 shrink-0" id="countryCode">
                  <SelectValue>
                    {field.value ? (
                      <span className="flex items-center gap-2">
                        {countryCodes.find((c) => c.countryCode === field.value)?.label.split(" ")[0]}
                        {" "}
                        {countryCodes.find((c) => c.countryCode === field.value)?.dialCode}
                      </span>
                    ) : (
                      "Code"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.label} value={country.countryCode}>
                      {country.label} ({country.dialCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-1 flex-col gap-1">
                <div className="relative flex-1">
                  <PhoneIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id="phone"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]*"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter 10-digit number"
                    className="pl-10"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);
                    }}
                  />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </div>
            )}
          />
        </div>
      </Field>

      <Controller
        name="hobby"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Hobby</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Your hobby"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" id={field.name}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="education"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Education</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Your education"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Date of Birth</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="date"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="location"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Location</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="City, Country"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting || !isDirty || !isValid}
      >
        {isSubmitting ?
          <>
            <Loader2Icon className="animate-spin" /> Saving...
          </>
        : <>
            <SaveIcon /> Save Changes
          </>
        }
      </Button>
    </form>
  );
};

export { ProfileForm };
