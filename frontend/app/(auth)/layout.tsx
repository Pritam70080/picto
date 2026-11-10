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
      <div className="relative h-dvh min-h-0 overflow-hidden bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-32 -top-40 size-[30rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-48 -right-40 size-[34rem] rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="absolute right-4 top-4 z-10">
          <ThemeToggler />
        </div>

        <main className="relative flex h-full min-h-0 items-center justify-center overflow-hidden px-4 py-2 sm:px-6 [@media(max-height:440px)]:items-center [@media(max-height:440px)]:pt-12">
          <div className="w-full max-w-md">
            <div className="mb-3 text-center [@media(max-height:600px)]:mb-2 [@media(max-height:440px)]:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex size-6 items-center justify-center shadow-lg shadow-primary/20">
                  <img src="/Picto.png" alt="Picto" />
                </span>
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  Picto
                </span>
              </Link>
              <p className="mt-1 text-sm text-muted-foreground [@media(max-height:600px)]:hidden">
                A home for every photo, story, and memory.
              </p>
            </div>

            <Card className="h-[min(33rem,calc(100dvh_-_4rem))] min-h-0 w-full border-border/60 bg-card/85 py-4 shadow-2xl shadow-primary/5 backdrop-blur-xl [@media(max-height:600px)]:py-2">
              <CardContent className="flex min-h-0 flex-1 flex-col px-4 py-0">
                {children}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </GuestGuard>
  );
}