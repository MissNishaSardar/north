"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle2Icon, UserIcon, LogOutIcon } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/shadcnui/button";

type ProfileDropdownProps = {
  avatarSrc?: string | null;
};

const ProfileDropdown = ({ avatarSrc }: ProfileDropdownProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully!");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out.");
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Profile menu"
      >
        {avatarSrc ?
          <Image
            src={avatarSrc}
            alt=""
            className="size-6 rounded-full object-cover"
            height={24}
            width={24}
          />
        : <UserCircle2Icon className="size-6" />
        }
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border bg-popover p-1 shadow-md">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <UserIcon className="size-4" />
            View Profile
          </Link>

          <hr className="my-1 border-t" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOutIcon className="size-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
