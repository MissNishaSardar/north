"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFilePicker } from "use-file-picker";
import { CameraIcon, LogOutIcon } from "lucide-react";
import ThemeToggleButton from "@/components/Layout/ThemeToggleButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcnui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcnui/dropdown-menu";
import { toast } from "@/components/shadcnui/toast";
import { uploadAvatar } from "@/actions/user";
import { authClient } from "@/lib/auth-client";

type NavbarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const Navbar = ({ user }: { user: NavbarUser }) => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const { openFilePicker } = useFilePicker({
    accept: "image/*",
    multiple: false,
    readFilesContent: false,
    onFilesSelected: async ({ plainFiles }) => {
      const file = plainFiles?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.add({ title: "Invalid file", type: "error", description: "Please choose an image file." });
        return;
      }

      if (file.size > MAX_AVATAR_SIZE) {
        toast.add({ title: "Image too large", type: "error", description: "Maximum size is 5MB." });
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        await uploadAvatar(formData);
        toast.add({ title: "Avatar updated", type: "success" });
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong.";
        toast.add({ title: "Upload failed", type: "error", description: message });
      } finally {
        setUploading(false);
      }
    },
  });

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/sign-in";
  };

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="font-heading text-lg font-semibold tracking-tight">
          North
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Open user menu"
              className="rounded-full transition-opacity outline-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50">
              <Avatar>
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={openFilePicker} disabled={uploading}>
                  <CameraIcon />
                  {uploading ? "Uploading…" : "Change Avatar"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;