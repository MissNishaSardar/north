"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { createTaskAction, updateTaskAction } from "@/server/task-actions";
import { createTaskSchema, type CreateTaskSchema } from "@/lib/zodSchema";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon, SaveIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Textarea } from "@/components/shadcnui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";

const statusOptions = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
] as const;

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const toDateString = (date: Date | null | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type TaskFormProps = {
  task?: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
  };
};

const TaskForm = ({ task }: TaskFormProps) => {
  const { replace } = useRouter();
  const isEdit = !!task;

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid, isDirty },
    reset,
  } = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: (task?.status as CreateTaskSchema["status"]) ?? "todo",
      priority: (task?.priority as CreateTaskSchema["priority"]) ?? "medium",
      dueDate: toDateString(task?.dueDate ?? null),
    },
    mode: "all",
  });

  const onSubmit = async (data: CreateTaskSchema) => {
    try {
      if (isEdit && task) {
        const { error } = await updateTaskAction(task.id, data);

        if (error) {
          toast.error(error);
        } else {
          toast.success("Task updated!");
          replace(`/tasks/${task.id}`);
        }
      } else {
        const { task: created, error } = await createTaskAction(data);

        if (error) {
          toast.error(error);
        } else if (created) {
          toast.success("Task created!");
          reset();
          replace(`/tasks/${created.id}`);
        }
      }
    } catch {
      toast.error(`Failed to ${isEdit ? "update" : "create"} task.`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6"
      noValidate
    >
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Enter task title"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Enter task description"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Status</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
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
          name="priority"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      <Controller
        name="dueDate"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Due Date</FieldLabel>
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

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting || (isEdit && !isDirty) || !isValid}
      >
        {isSubmitting ?
          <>
            <Loader2Icon className="animate-spin" /> {isEdit ? "Saving..." : "Creating..."}
          </>
        : <>
            {isEdit ? <SaveIcon /> : <PlusIcon />} {isEdit ? "Update Task" : "Create Task"}
          </>
        }
      </Button>
    </form>
  );
};

export { TaskForm };
