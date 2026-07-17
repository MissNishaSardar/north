import ThemeProvider from "@/components/Providers/ThemeProvider";
import { TooltipProvider } from "@/components/shadcnui/tooltip";
import { notoSansHeading, nunitoSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "North",
    template: "%s | North",
  },
  description: "North application",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        "font-sans",
        nunitoSans.variable,
        notoSansHeading.variable,
      )}
      suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute={"class"}
          defaultTheme="dark"
          enableSystem={false}>
          <TooltipProvider>
            <main className="">{children}</main>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
