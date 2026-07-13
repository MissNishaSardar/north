import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcnui/card";
import { Button } from "@/components/shadcnui/button";
import { ProfileForm } from "@/components/Profile/ProfileForm";
import UpdateAvatarForm from "@/components/Forms/UpdateAvatarForm";

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
    <>
      <header className="flex items-center justify-between border-b px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">
            Update your personal information
          </p>
        </div>
        <Link href="/profile">
          <Button variant="outline">
            <ArrowLeftIcon /> Back to Profile
          </Button>
        </Link>
      </header>

      <main className="flex-1 space-y-8 p-8">
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
      </main>
    </>
  );
};

export default EditProfilePage;
