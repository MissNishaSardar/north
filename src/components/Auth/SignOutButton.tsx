"use client";

import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/sign-in";
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      <LogOutIcon data-icon="inline-start" />
      Sign out
    </Button>
  );
};

export default SignOutButton;
