"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/shadcnui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcnui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import { createTask, deleteTask, updateTask } from "@/actions/task";
import { taskSchema, taskType } from "@/lib/zodSchema";

export type TaskDialogTask = {
  id: string;
  title: string;
  priority: taskType["priority"];
  dueDate?: Date | string | null;
};

const toDateInputValue = (value: Date | string | null | undefined) => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return value;
};

const TaskDialog = ({
  task = null,
  trigger,
}: {
  task?: TaskDialogTask | null;
  trigger?: React.ReactElement;
}) => {
  const [open, setOpen] = React.useState(false);
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<taskType>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      priority: "MEDIUM",
      dueDate: "",
    },
    mode: "all",
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: task?.title ?? "",
        priority: task?.priority ?? "MEDIUM",
        dueDate: toDateInputValue(task?.dueDate),
      });
    }
  }, [open, task, reset]);

  const onSubmit = async (values: taskType) => {
    try {
      if (task) {
        await updateTask(task.id, values);
      } else {
        await createTask(values);
      }

      toast.add({
        title: task ? "Task updated" : "Task created",
        type: "success",
      });
      setOpen(false);
    } catch (error) {
      toast.add({
        title: "Failed to save task",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    }
  };

  const onDelete = async () => {
    if (!task) {
      return;
    }

    try {
      await deleteTask(task.id);
      toast.add({ title: "Task deleted", type: "success" });
      setOpen(false);
    } catch (error) {
      toast.add({
        title: "Failed to delete task",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button data-icon="inline-start" />}>
        {trigger ? null : (
          <>
            <PlusIcon data-icon="inline-start" />
            New task
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update the details of this task."
              : "Add a new task to your board."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="e.g. Write release notes"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={field.name} aria-label="Priority">
                      <SelectValue placeholder="Select a priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                  />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            {task && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              {isSubmitting ? "Saving..." : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;