import { z } from "zod";

const emailSchema = z.email({ error: "Enter a valid email address" });

const passwordSchema = z
  .string()
  .min(12, { error: "Password must be at least 12 characters" })
  .max(128, { error: "Password must be 128 characters or fewer" });

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Password is required" }),
});
export type signinType = z.infer<typeof signinSchema>;

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: "Name is required" })
      .max(50, { error: "Name must be 50 characters or fewer" }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });
export type signupType = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type forgotPasswordType = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });
export type resetPasswordType = z.infer<typeof resetPasswordSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type taskPriorityType = z.infer<typeof taskPrioritySchema>;

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export type taskStatusType = z.infer<typeof taskStatusSchema>;

const dueDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Due date must be a valid date" })
  .optional();

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Title is required" })
    .max(100, { error: "Title must be 100 characters or fewer" }),
  priority: taskPrioritySchema,
  dueDate: dueDateSchema,
});
export type taskType = z.infer<typeof taskSchema>;

export const banDurationSchema = z.enum(["permanent", "1d", "7d", "30d"]);
export type banDurationType = z.infer<typeof banDurationSchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(50, { error: "Name must be 50 characters or fewer" }),
});
export type profileType = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Current password is required" }),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
    if (data.newPassword === data.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "New password must be different from your current password",
      });
    }
  });
export type changePasswordType = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, { error: "Password is required" }),
});
export type deleteAccountType = z.infer<typeof deleteAccountSchema>;

export const banSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, { error: "Reason is required" })
    .max(200, { error: "Reason must be 200 characters or fewer" }),
  duration: banDurationSchema,
});
export type banType = z.infer<typeof banSchema>;
