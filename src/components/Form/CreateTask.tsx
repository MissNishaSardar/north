"use client";

import { Button } from "@/components/shadcnui/button";
import { CardContent, CardFooter } from "@/components/shadcnui/card";
import {
  Field,
  FieldContent,
  FieldError,
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
import { Textarea } from "@/components/shadcnui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcnui/popover";
import { Calendar } from "@/components/shadcnui/calendar";
import { Separator } from "@/components/shadcnui/separator";
import { createTaskSchema, type CreateTaskType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2, Target } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

function CreateTask() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateTaskType>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
    },
    mode: "all",
  });

  const onSubmit = async (values: CreateTaskType) => {
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardContent className="flex flex-col gap-6">
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Target className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="Enter task title"
                    autoComplete="off"
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
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <FieldContent>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Add details about your task..."
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
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
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
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
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
                    }
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {field.value ?
                      format(new Date(field.value), "PPP")
                    : <span className="text-muted-foreground">Pick a date</span>}
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
          disabled={isSubmitting}
        >
          {isSubmitting ?
            <Loader2 className="size-4 animate-spin" />
          : <Check className="size-4" />}
          {isSubmitting ? "Creating task..." : "Create task"}
        </Button>
      </CardFooter>
    </form>
  );
}

export default CreateTask;