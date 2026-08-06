import { z } from "zod";

const emailSchema = z.email({ error: "Enter a valid email address" });

const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters" });

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

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Title is required" })
    .max(100, { error: "Title must be 100 characters or fewer" }),
  priority: taskPrioritySchema,
  dueDate: z.string().optional(),
});
export type taskType = z.infer<typeof taskSchema>;
