"use client";

import Link from "next/link";
import { LogOutIcon } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";

type NavbarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

const Navbar = ({ user }: { user: NavbarUser }) => {
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
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
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