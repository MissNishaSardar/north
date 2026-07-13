"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  GraduationCapIcon,
  HeartIcon,
  BookOpenIcon,
  PencilIcon,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcnui/card";
import { Button } from "@/components/shadcnui/button";
import { countryCodes } from "@/components/Profile/countries";

type ViewProfileUser = {
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  phone: number | null;
  countryCode: string | null;
  hobby: string | null;
  gender: string | null;
  education: string | null;
  dateOfBirth: Date | null;
  location: string | null;
  createdAt: Date;
};

type ViewProfileProps = {
  user: ViewProfileUser;
};

const genderLabels: Record<string, string> = {
  male: "Male",
  female: "Female",
  non_binary: "Non-binary",
  prefer_not_to_say: "Prefer not to say",
  other: "Other",
};

const formatDate = (date: Date | null | undefined) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const formatMemberSince = (date: Date) => {
  const now = new Date();
  const d = new Date(date);
  const years = now.getFullYear() - d.getFullYear();
  const months = now.getMonth() - d.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 1) return "Less than a month";
  if (totalMonths < 12) return `${totalMonths} month${totalMonths > 1 ? "s" : ""}`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return `${y} year${y > 1 ? "s" : ""}${m ? `, ${m} month${m > 1 ? "s" : ""}` : ""}`;
};

const calculateAge = (dateOfBirth: Date) => {
  const now = new Date();
  const d = new Date(dateOfBirth);
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  return age;
};

type FieldEntry = {
  icon: React.ReactNode;
  label: string;
  value: string | null;
};

const ViewProfile = ({ user }: ViewProfileProps) => {
  const { push } = useRouter();
  const fields: FieldEntry[] = [
    { icon: <MailIcon className="size-4" />, label: "Email", value: user.email },
    { icon: <PhoneIcon className="size-4" />, label: "Phone", value: user.phone ? `${countryCodes.find((c) => c.countryCode === (user.countryCode ?? "91"))?.dialCode ?? "+91"} ${user.phone}` : null },
    { icon: <MapPinIcon className="size-4" />, label: "Location", value: user.location },
    { icon: <HeartIcon className="size-4" />, label: "Gender", value: user.gender ? genderLabels[user.gender] ?? user.gender : null },
    { icon: <GraduationCapIcon className="size-4" />, label: "Education", value: user.education },
    { icon: <BookOpenIcon className="size-4" />, label: "Hobby", value: user.hobby },
    { icon: <CalendarIcon className="size-4" />, label: "Date of Birth", value: user.dateOfBirth ? `${formatDate(user.dateOfBirth)} (${calculateAge(user.dateOfBirth)} years)` : null },
  ];

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        {user.image ?
          <Image
            src={user.image}
            alt={user.name}
            className="size-16 rounded-full object-cover"
            height={64}
            width={64}
          />
        : <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <span className="text-2xl font-bold text-muted-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        }
        <div>
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Member for {formatMemberSince(user.createdAt)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {user.bio && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">Bio</h3>
            <p className="text-sm">{user.bio}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="flex items-start gap-3">
              <div className="mt-0.5 text-muted-foreground">{field.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium">
                  {field.value ?? <span className="italic text-muted-foreground">Not set</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={() => push("/profile/edit")}>
          <PencilIcon /> Edit Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export { ViewProfile };
