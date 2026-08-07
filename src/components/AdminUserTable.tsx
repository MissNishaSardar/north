"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BanIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  ShieldIcon,
  TrashIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcnui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcnui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import { Spinner } from "@/components/shadcnui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcnui/table";
import { Textarea } from "@/components/shadcnui/textarea";
import { toast } from "@/components/shadcnui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcnui/tooltip";
import { banUser, deleteUser, toggleUserRole, unbanUser } from "@/actions/admin";
import { banSchema, type banType } from "@/lib/zodSchema";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  banned: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
};

const BAN_DURATION_LABELS: Record<banType["duration"], string> = {
  permanent: "Permanent",
  "1d": "1 day",
  "7d": "7 days",
  "30d": "30 days",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatExpiry = (expires: Date | string | null | undefined) => {
  if (!expires) {
    return null;
  }

  const date = expires instanceof Date ? expires : new Date(expires);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
};

const BanUserDialog = ({
  user,
  open,
  onOpenChange,
  onSuccess,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<banType>({
    resolver: zodResolver(banSchema),
    defaultValues: { reason: "", duration: "permanent" },
    mode: "all",
  });

  React.useEffect(() => {
    if (open) {
      reset({ reason: "", duration: "permanent" });
    }
  }, [open, reset]);

  const onSubmit = async (values: banType) => {
    if (!user) {
      return;
    }

    try {
      await banUser(user.id, values);
      toast.add({ title: "User banned", type: "success" });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.add({
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban {user?.name ?? "user"}</DialogTitle>
          <DialogDescription>
            They will be signed out and blocked from signing in again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            name="reason"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="e.g. Spam or abusive behavior"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Duration</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-label="Ban duration"
                    className="w-full">
                    <SelectValue placeholder="Select a duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BAN_DURATION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <BanIcon data-icon="inline-start" />
              )}
              {isSubmitting ? "Banning..." : "Ban user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteUserDialog = ({
  user,
  open,
  onOpenChange,
  onSuccess,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    setDeleting(true);

    try {
      await deleteUser(user.id);
      toast.add({ title: "User deleted", type: "success" });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.add({
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {user?.name ?? "user"}?</DialogTitle>
          <DialogDescription>
            This permanently removes the account, their sessions, and their
            tasks. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={deleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}>
            {deleting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <TrashIcon data-icon="inline-start" />
            )}
            {deleting ? "Deleting..." : "Delete user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminUserTable = ({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) => {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [banTarget, setBanTarget] = React.useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUser | null>(null);

  const run = async (
    userId: string,
    action: () => Promise<void>,
    successTitle: string
  ) => {
    setPendingId(userId);

    try {
      await action();
      toast.add({ title: successTitle, type: "success" });
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
      });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const expiry = formatExpiry(user.banExpires);

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="size-8">
                      <AvatarImage src={user.image ?? undefined} alt={user.name} />
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.name}
                    {isSelf && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={<Badge variant="destructive" />}>
                          Banned
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-64">
                          <p className="font-medium">
                            {user.banReason || "No reason provided"}
                          </p>
                          {expiry && (
                            <p className="mt-0.5 text-xs opacity-80">
                              Expires {expiry}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="User actions"
                            disabled={pendingId === user.id}
                          />
                        }>
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              run(
                                user.id,
                                () => toggleUserRole(user.id),
                                user.role === "admin"
                                  ? "Role changed to user"
                                  : "Role changed to admin"
                              )
                            }
                            disabled={pendingId === user.id || isSelf}>
                            {user.role === "admin" ? (
                              <ShieldIcon />
                            ) : (
                              <ShieldCheckIcon />
                            )}
                            {user.role === "admin" ? "Make User" : "Make Admin"}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {user.banned ? (
                            <DropdownMenuItem
                              onClick={() =>
                                run(
                                  user.id,
                                  () => unbanUser(user.id),
                                  "User unbanned"
                                )
                              }
                              disabled={pendingId === user.id || isSelf}>
                              <UserRoundCheckIcon />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setBanTarget(user)}
                              disabled={pendingId === user.id || isSelf}>
                              <BanIcon />
                              Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                        {!isSelf && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(user)}
                                disabled={pendingId === user.id}>
                                <TrashIcon />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <BanUserDialog
        user={banTarget}
        open={banTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBanTarget(null);
          }
        }}
        onSuccess={() => router.refresh()}
      />
      <DeleteUserDialog
        user={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onSuccess={() => router.refresh()}
      />
    </>
  );
};

export default AdminUserTable;
