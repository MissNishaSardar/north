import { CalendarIcon, MailIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Separator } from "@/components/shadcnui/separator";

type ProfileHeroUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  emailVerified?: boolean;
};

const ProfileHeroCard = ({
  user,
  memberSince,
}: {
  user: ProfileHeroUser;
  memberSince: string;
}) => {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="gap-0">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-heading text-xl font-semibold tracking-tight">
              {user.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Admin" : "Member"}
              </Badge>
              <Badge variant={user.emailVerified ? "outline" : "destructive"}>
                {user.emailVerified ? "Email verified" : "Email unverified"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="mt-4 mb-0" />

        <dl className="flex flex-col">
          <div className="flex items-center justify-between gap-4 border-t border-border py-3">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <MailIcon className="size-4 shrink-0" />
              Email
            </dt>
            <dd className="truncate text-sm font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border py-3">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="size-4 shrink-0" />
              Member since
            </dt>
            <dd className="text-sm font-medium">{memberSince}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default ProfileHeroCard;