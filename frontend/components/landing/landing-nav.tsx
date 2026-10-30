"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ImagePlus, Menu, X } from "lucide-react";
import { ThemeToggler } from "@/components/theme-toggler";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function LandingNav() {
  const { isReady, isLoggedIn } = useAuth();
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      id="top"
      className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl"
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Picto home">
          <span className="grid size-8 place-items-center rounded-lg ">
            <img src="/Picto.png" alt="Picto" />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.06em] text-foreground">
            picto<span className="text-primary dark:text-sidebar-primary">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#transformations" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
            AI tools
          </a>
          <a href="#demo" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
            Try Picto
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggler />
          {isReady && isLoggedIn ? (
            <>
              {user && (
                <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:text-sidebar-primary">
                  {user.displayName.trim().charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-28 truncate text-xs text-muted-foreground">
                {user?.displayName}
              </span>
              <Link
                href="/photos"
                className="group flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Your photos
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : isReady ? (
            <>
              <Link
                href="/login"
                className="px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="group flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Get started
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : (
            <span className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggler />
          <button
            type="button"
            className="grid size-9 place-items-center rounded-md text-foreground"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-muted-foreground">
                How it works
              </a>
              <a href="#transformations" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-muted-foreground">
                AI tools
              </a>
              <a href="#demo" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-muted-foreground">
                Try Picto
              </a>
              {isReady && (
                <Link
                  href={isLoggedIn ? "/photos" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 flex items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                >
                  {isLoggedIn ? "Your photos" : "Log in"}
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
