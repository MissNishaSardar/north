"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BanIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcnui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcnui/table";
import { toast } from "@/components/shadcnui/toast";
import { toggleBanStatus, toggleUserRole } from "@/actions/admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  banned: boolean | null;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AdminUserTable = ({ users }: { users: AdminUser[] }) => {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar className="size-8">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
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
                    }
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
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
                      disabled={pendingId === user.id}
                    >
                      {user.role === "admin" ? (
                        <ShieldIcon />
                      ) : (
                        <ShieldCheckIcon />
                      )}
                      {user.role === "admin" ? "Make User" : "Make Admin"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant={user.banned ? "default" : "destructive"}
                      onClick={() =>
                        run(
                          user.id,
                          () => toggleBanStatus(user.id),
                          user.banned ? "User unbanned" : "User banned"
                        )
                      }
                      disabled={pendingId === user.id}
                    >
                      {user.banned ? (
                        <UserRoundCheckIcon />
                      ) : (
                        <BanIcon />
                      )}
                      {user.banned ? "Unban User" : "Ban User"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUserTable;
