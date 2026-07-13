import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserCircleIcon } from "lucide-react";
import { ViewProfile } from "@/components/Profile/ViewProfile";

export const metadata: Metadata = {
  title: "Profile",
  description: "View your profile",
};

const ProfilePage = async () => {
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
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Your personal information
          </p>
        </div>
        {user.image ?
          <Image
            src={user.image}
            alt=""
            className="size-10 rounded-full object-cover"
            height={40}
            width={40}
          />
        : <UserCircleIcon className="size-10 text-muted-foreground" />
        }
      </header>

      <main className="flex-1 space-y-8 p-8">
        <ViewProfile
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
      </main>
    </>
  );
};

export default ProfilePage;
