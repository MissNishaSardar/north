import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import ChangePasswordForm from "@/components/Profile/ChangePasswordForm";
import DeleteAccountDialog from "@/components/Profile/DeleteAccountDialog";
import ProfileDetailsForm from "@/components/Profile/ProfileDetailsForm";
import { Badge } from "@/components/shadcnui/badge";
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
    <main className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details and security settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your email address and the day you joined North.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium">{memberSince}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "Admin" : "Member"}
            </Badge>
            <Badge variant={user.emailVerified ? "outline" : "destructive"}>
              {user.emailVerified ? "Email verified" : "Email unverified"}
            </Badge>
          </div>
        </CardContent>
      </Card>

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
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Changing your password signs out your other active sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
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
