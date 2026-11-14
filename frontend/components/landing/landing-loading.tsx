"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Aperture, Image as ImageIcon, Sparkles } from "lucide-react";

export function LandingLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 text-foreground"
    >
      <div className="landing-dot-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute left-[-10%] top-[-18%] size-[380px] rounded-full bg-primary/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-8%] size-[420px] rounded-full bg-sidebar-primary/10 blur-[120px]" />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <motion.div
          aria-hidden="true"
          className="relative mb-9 flex h-48 w-56 items-center justify-center"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute size-40 rounded-full border border-primary/10" />
          <motion.div
            className="absolute size-48 rounded-full border border-dashed border-primary/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute left-5 top-6 grid size-24 -rotate-12 place-items-center rounded-xl border border-border bg-card shadow-lg">
            <div className="grid size-16 place-items-center rounded-lg bg-gradient-to-br from-sky-200 via-cyan-100 to-indigo-200 text-primary dark:from-sky-900 dark:via-cyan-950 dark:to-indigo-900">
              <ImageIcon className="size-7 opacity-75" strokeWidth={1.4} />
            </div>
          </div>
          <div className="absolute right-5 top-8 grid size-24 rotate-12 place-items-center rounded-xl border border-border bg-card shadow-lg">
            <div className="grid size-16 place-items-center rounded-lg bg-gradient-to-br from-amber-100 via-rose-100 to-fuchsia-200 text-rose-700 dark:from-amber-950 dark:via-rose-950 dark:to-fuchsia-900 dark:text-rose-200">
              <Sparkles className="size-7 opacity-75" strokeWidth={1.4} />
            </div>
          </div>
          <div className="absolute bottom-3 z-10 grid size-24 place-items-center rounded-xl border border-border bg-card shadow-xl">
            <div className="grid size-16 place-items-center rounded-lg bg-gradient-to-br from-emerald-100 via-teal-100 to-sky-200 text-teal-800 dark:from-emerald-950 dark:via-teal-950 dark:to-sky-900 dark:text-teal-200">
              <Aperture className="size-8 opacity-80" strokeWidth={1.3} />
            </div>
          </div>
          <motion.span
            className="absolute right-7 top-1 z-20 grid size-9 place-items-center rounded-full border border-border bg-background text-primary shadow-md dark:text-sidebar-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="size-4" />
          </motion.span>
        </motion.div>

        <div className="mb-5 flex items-center gap-2.5">
          <Image
            src="/Picto.png"
            alt="Picto"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="text-xl font-semibold tracking-[-0.06em]">
            picto<span className="text-primary dark:text-sidebar-primary">.</span>
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-3xl italic tracking-tight sm:text-4xl">
          Checking your space
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
          Gathering your moments and getting everything ready.
        </p>

        <div className="mt-8 flex items-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="size-1.5 rounded-full bg-primary/70"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: dot * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
