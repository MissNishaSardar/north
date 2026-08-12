import { KeyRoundIcon, TrashIcon } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ChangePasswordForm from "@/components/Profile/ChangePasswordForm";
import DeleteAccountDialog from "@/components/Profile/DeleteAccountDialog";
import ProfileDetailsForm from "@/components/Profile/ProfileDetailsForm";
import ProfileHeroCard from "@/components/Profile/ProfileHeroCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your account details and security settings.",
};

const ProfilePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;
  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details and security settings.
        </p>
      </div>

      <ProfileHeroCard user={user} memberSince={memberSince} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Update your display name and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileDetailsForm user={user} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRoundIcon className="size-4" />
              Password
            </CardTitle>
            <CardDescription>
              Changing your password signs out your other active sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>

      <Card className="ring-destructive/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TrashIcon className="size-4" />
            Danger zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog userName={user.name} />
        </CardContent>
      </Card>
    </main>
  );
};

export default ProfilePage;