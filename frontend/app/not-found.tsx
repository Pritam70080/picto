import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_20%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_42%),radial-gradient(ellipse_at_85%_82%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent_38%)]"
      />

      <div className="relative grid w-full max-w-5xl items-center gap-12 md:grid-cols-[1fr_0.9fr] md:gap-16">
        <section className="order-2 text-center md:order-1 md:text-left">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
            aria-label="Picto home"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <img src="/Picto.png" alt="Picto" />
            </span>
            Picto
          </Link>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Lost in the library
          </p>
          <h1 className="font-heading text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            This moment
            <br />
            isn&apos;t here.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground md:mx-0">
            We couldn&apos;t find the page you were looking for. Your photos are
            safe — let&apos;s get you back to them.
          </p>

          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 rounded-full px-6 shadow-lg shadow-primary/15",
            )}
          >
            Go home
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>

          <p className="mt-8 text-sm text-muted-foreground">
            Error code <span className="font-mono text-foreground/70">404</span>
          </p>
        </section>

        <div
          aria-hidden="true"
          className="order-1 mx-auto flex aspect-square w-full max-w-sm items-center justify-center md:order-2"
        >
          <div className="relative grid aspect-square w-[82%] place-items-center rounded-[2.5rem] border border-border/70 bg-card/70 shadow-2xl shadow-primary/10 backdrop-blur-sm">
            <div className="absolute inset-3 rounded-[2rem] border border-dashed border-border/80" />
            <div className="absolute left-7 top-7 size-2 rounded-full bg-primary/40" />
            <div className="absolute right-8 top-12 size-1.5 rounded-full bg-primary/30" />
            <div className="absolute bottom-10 left-10 size-1.5 rounded-full bg-primary/30" />

            <div className="relative grid size-44 rotate-[-8deg] place-items-center rounded-[2rem] border border-white/60 bg-gradient-to-br from-sky-200 via-cyan-100 to-amber-100 shadow-xl shadow-sky-900/10 dark:border-white/10 dark:from-sky-950 dark:via-cyan-950 dark:to-amber-950 sm:size-52">
              <div className="absolute inset-3 rounded-[1.5rem] border border-white/60 dark:border-white/10" />
              <div className="absolute right-8 top-8 size-8 rounded-full bg-amber-300/90 shadow-lg shadow-amber-400/40 dark:bg-amber-200/70" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-[2rem]">
                <div className="absolute -bottom-9 -left-5 size-36 rotate-45 rounded-3xl bg-emerald-500/75 dark:bg-emerald-700/70" />
                <div className="absolute -bottom-11 -right-7 size-40 -rotate-45 rounded-3xl bg-teal-700/80 dark:bg-teal-500/50" />
              </div>
              <span className="relative z-10 grid size-16 place-items-center rounded-2xl border border-white/60 bg-white/70 text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100">
                <ImageIcon className="size-8" strokeWidth={1.5} />
              </span>
            </div>

            <span className="absolute -right-4 top-[22%] grid size-12 rotate-12 place-items-center rounded-2xl border border-border/70 bg-background shadow-lg">
              <Sparkles className="size-5 text-primary" />
            </span>
            <span className="absolute -bottom-4 left-[18%] rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground shadow-lg">
              A little off the map
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
