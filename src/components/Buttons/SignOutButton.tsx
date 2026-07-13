"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/shadcnui/button";

const SignOutButton = () => {
  const router = useRouter();

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
    <Button variant="ghost" onClick={handleSignOut}>
      <LogOutIcon /> Sign out
    </Button>
  );
};

export default SignOutButton;
