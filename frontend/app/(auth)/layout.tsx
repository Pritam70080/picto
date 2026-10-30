import type { Metadata } from "next";
import Link from "next/link";
import { GuestGuard } from "@/components/auth/guest-guard";
import { ThemeToggler } from "@/components/theme-toggler";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in or create your photo library",
  description:
    "Sign in to Picto or create an account to store, organize, and edit your photos in one personal library.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="relative flex h-dvh min-h-0 flex-col items-center justify-center overflow-y-auto bg-background px-4 py-6 sm:py-10">
        <div className="absolute right-4 top-4">
          <ThemeToggler />
        </div>

        <div className="my-4 shrink-0 text-center sm:mb-6">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground">
            Picto
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            A home for every photo, story, and memory.
          </p>
        </div>

        <Card className="w-full max-w-md shrink-0 border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-2.5">{children}</CardContent>
        </Card>
      </div>
    </GuestGuard>
  );
}