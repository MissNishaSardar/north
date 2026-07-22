"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";

const backLinks: Record<string, { href: string; label: string }> = {
  "/profile/edit": { href: "/profile", label: "Back to Profile" },
};

const backLinkPatterns: Array<{
  pattern: RegExp;
  getConfig: (match: RegExpMatchArray) => { href: string; label: string };
}> = [
  {
    pattern: /^\/tasks\/([^/]+)$/,
    getConfig: () => ({ href: "/tasks", label: "Back to Tasks" }),
  },
  {
    pattern: /^\/tasks\/([^/]+)\/edit$/,
    getConfig: (m) => ({
      href: `/tasks/${m[1]}`,
      label: "Back to Task",
    }),
  },
  {
    pattern: /^\/tasks\/history$/,
    getConfig: () => ({ href: "/tasks", label: "Back to Tasks" }),
  },
  {
    pattern: /^\/tasks\/preview$/,
    getConfig: () => ({ href: "/tasks", label: "Back to Tasks" }),
  },
];

const BreadcrumbNav = () => {
  const pathname = usePathname();

  const exact = backLinks[pathname];
  if (exact) {
    return (
      // @ts-expect-error - typedRoutes expects route literals, but values are dynamic
      <Link href={exact.href}>
        <Button
          variant="ghost"
          className="gap-1">
          <ArrowLeftIcon className="size-4" />
          {exact.label}
        </Button>
      </Link>
    );
  }

  for (const { pattern, getConfig } of backLinkPatterns) {
    const match = pathname.match(pattern);
    if (match) {
      const { href, label } = getConfig(match);
      return (
        // @ts-expect-error - typedRoutes expects literal, but href is dynamic
        <Link href={href}>
          <Button
            variant="ghost"
            className="gap-1">
            <ArrowLeftIcon className="size-4" />
            {label}
          </Button>
        </Link>
      );
    }
  }

  return null;
};

export default BreadcrumbNav;
