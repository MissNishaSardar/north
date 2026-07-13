"use client";

import { useRouter } from "next/navigation";
import { Trash2Icon, Loader2Icon } from "lucide-react";
import { toast } from "react-toastify";
import { deleteTaskAction } from "@/server/task-actions";
import { Button } from "@/components/shadcnui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcnui/alert-dialog";
import { useState } from "react";

type DeleteTaskButtonProps = {
  taskId: string;
  taskTitle: string;
  onSuccess?: () => void;
  variant?: "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "icon" | "icon-sm";
};

const DeleteTaskButton = ({
  taskId,
  taskTitle,
  onSuccess,
  variant = "outline",
  size = "default",
}: DeleteTaskButtonProps) => {
  const { replace } = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    setPending(true);
    try {
      const { error } = await deleteTaskAction(taskId);

      if (error) {
        toast.error(error);
        setPending(false);
        setOpen(false);
      } else {
        toast.success("Task deleted!");
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          replace("/tasks");
        }
      }
    } catch {
      toast.error("Failed to delete task.");
      setPending(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant={variant} size={size}>
            <Trash2Icon /> Delete
          </Button>
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{taskTitle}&rdquo;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ?
              <><Loader2Icon className="animate-spin" /> Deleting...</>
            : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { DeleteTaskButton };
