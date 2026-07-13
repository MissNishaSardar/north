"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { createTaskAction } from "@/server/task-actions";
import { createTaskSchema, type CreateTaskSchema } from "@/lib/zodSchema";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon } from "lucide-react";
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

const CreateTaskForm = () => {
  const { replace } = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    },
    mode: "all",
  });

  const onSubmit = async (data: CreateTaskSchema) => {
    try {
      const { task, error } = await createTaskAction(data);

      if (error) {
        toast.error(error);
      } else if (task) {
        toast.success("Task created!");
        reset();
        replace(`/tasks/${task.id}`);
      }
    } catch {
      toast.error("Failed to create task.");
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

      <div className="flex gap-3">
        <Button
          className="flex-1"
          type="submit"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ?
            <>
              <Loader2Icon className="animate-spin" /> Creating...
            </>
          : <>
              <PlusIcon /> Create Task
            </>
          }
        </Button>
      </div>
    </form>
  );
};

export { CreateTaskForm };
