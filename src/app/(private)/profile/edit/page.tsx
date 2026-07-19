import { ProfileForm } from "@/components/Profile/ProfileForm";
import UpdateAvatarForm from "@/components/Profile/UpdateAvatarForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Edit your profile information",
};

const EditProfilePage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground text-sm">
          Update your personal information
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <UpdateAvatarForm prevImage={user.image} />
      </Card>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            user={{
              name: user.name,
              email: user.email,
              image: user.image,
              bio: user.bio,
              phone: user.phone,
              countryCode: user.countryCode,
              hobby: user.hobby,
              gender: user.gender,
              education: user.education,
              dateOfBirth: user.dateOfBirth,
              location: user.location,
              createdAt: user.createdAt,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfilePage;
