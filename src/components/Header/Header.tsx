"use client";

import { authClient } from "@/lib/auth-client";
import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import ThemeToggleButton from "../Buttons/ThemeToggleButton";
import { Button } from "../shadcnui/button";

const Header = () => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 border-b shadow"
      aria-label="app-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href={"/"}>
          <h1
            className="text-2xl font-semibold"
            aria-label="App Name">
            NORTH
          </h1>
        </Link>

        <nav className="flex items-center gap-4">
          {isPending ?
            <Loader2 className="size-4 animate-spin" />
          : user ?
            <>
              <Link
                href="/tasks/create"
                className="text-sm font-medium underline-offset-4 hover:underline">
                New Task
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </>
          : <>
              <Link
                href="/"
                className="text-sm font-medium underline-offset-4 hover:underline">
                Login
              </Link>
            </>
          }

          <ThemeToggleButton />
        </nav>
      </div>
    </header>
  );
};

export default Header;
