"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

export function TransformationSection() {
  return (
    <section
      id="transformations"
      className="scroll-mt-16 border-y border-border bg-muted/40"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:gap-12 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <span className="mb-5 grid size-11 place-items-center rounded-lg bg-card text-primary dark:text-sidebar-primary">
            <Sparkles className="size-5" />
          </span>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-primary dark:text-sidebar-primary">
            Your imagination, invited
          </p>
          <h2 className="text-4xl font-normal leading-[1.08] tracking-[-0.065em] text-foreground sm:text-5xl">
            The edit starts with an idea.
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Tell Picto what you&apos;re picturing. Keep the original close,
            experiment freely, and save the version that feels like you.
          </p>
          <a
            href="#demo"
            className="group mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary dark:text-sidebar-primary"
          >
            Play with the demo
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden border border-primary/30 bg-primary p-6 text-primary-foreground sm:p-10"
        >
          <div className="absolute inset-y-0 right-[17%] w-px bg-white/10" />
          <div className="absolute inset-x-0 top-[30%] h-px bg-white/10" />
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 left-[17%] w-px bg-primary-foreground/80 shadow-[0_0_20px_4px_rgba(255,255,255,0.35)]"
            animate={{ opacity: [0.2, 0.8, 0.2], scaleY: [0.8, 1, 0.8] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative">
            <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/65 sm:mb-8">
              A note to your photo
            </p>
            <p className="max-w-lg text-2xl font-light leading-relaxed tracking-[-0.04em] sm:text-4xl">
              &ldquo;Keep the moment. Give it a{" "}
              <span className="font-[family-name:var(--font-heading)] italic text-primary-foreground/75">
                different feeling.
              </span>
              &rdquo;
            </p>
            <div className="mt-8 flex items-center gap-2 border-t border-primary-foreground/20 pt-5 text-xs text-primary-foreground/70 sm:mt-10">
              <Sparkles className="size-3.5" />
              Make something that feels like you.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
