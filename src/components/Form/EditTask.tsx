"use client";

import { Button } from "@/components/shadcnui/button";
import { Calendar } from "@/components/shadcnui/calendar";
import { CardContent, CardFooter } from "@/components/shadcnui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcnui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import { Separator } from "@/components/shadcnui/separator";
import { Textarea } from "@/components/shadcnui/textarea";
import { updateTaskSchema, type UpdateTaskType } from "@/lib/zodSchema";
import { updateTaskAction } from "@/server/actions/taskAction";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface EditTaskProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    dueDate: string | null;
  };
}

function EditTask({ task }: EditTaskProps) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<UpdateTaskType>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      priority: task.priority as "low" | "medium" | "high",
      status: task.status as "pending" | "in_progress" | "completed",
      dueDate: task.dueDate ?? "",
    },
    mode: "all",
  });

  const onSubmit = async (values: UpdateTaskType) => {
    const result = await updateTaskAction(task.id, values);

    if (!result.success) {
      toast.error(result.error);

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          setError(field as keyof UpdateTaskType, {
            message: messages.join(", "),
          });
        }
      }

      return;
    }

    toast.success(result.message);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate>
      <CardContent className="flex flex-col gap-6 pb-6">
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  placeholder="Enter task title"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <FieldContent>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Enter task description (optional)"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <div className="flex gap-4">
          <Controller
            name="priority"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex-1">
                <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex-1">
                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
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
              <FieldContent>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      />
                    }>
                    <CalendarIcon className="mr-2 size-4" />
                    {field.value ?
                      format(new Date(field.value), "PPP")
                    : <span className="text-muted-foreground">Pick a date</span>
                    }
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </CardContent>

      <Separator className="mb-6" />
      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}>
          {isSubmitting ?
            <Loader2 className="size-4 animate-spin" />
          : <Save className="size-4" />}
          {isSubmitting ? "Saving changes..." : "Save changes"}
        </Button>
        <Link href={`/tasks/${task.id}`}>
          <Button
            variant="outline"
            className="w-full">
            Cancel
          </Button>
        </Link>
      </CardFooter>
    </form>
  );
}

export default EditTask;
