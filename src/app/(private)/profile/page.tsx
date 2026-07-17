import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
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
    </div>
  );
};

export default ProfilePage;
