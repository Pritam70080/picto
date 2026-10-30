"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-8 sm:py-20 lg:px-12 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="mx-auto mb-5 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary dark:text-sidebar-primary">
          <Sparkles className="size-[18px]" />
        </span>
        <h2 className="mx-auto max-w-2xl text-4xl font-normal leading-tight tracking-[-0.065em] text-foreground sm:text-6xl">
          Your camera roll has a little more in it.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground">
          Save the moments. Follow the what-ifs. Let Picto help you find
          something new in the photos you already love.
        </p>
        <Link
          href="/signup"
          className="group mx-auto mt-8 inline-flex items-center gap-3 rounded-md bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Get started with Picto
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}
