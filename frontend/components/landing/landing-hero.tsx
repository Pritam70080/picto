"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ProductDemo } from "@/components/landing/product-demo";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="landing-dot-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute right-[-8%] top-[-15%] size-[460px] rounded-full bg-primary/10 blur-[100px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:gap-12 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10 lg:px-12 lg:pb-28 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative z-10 max-w-xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 border border-border bg-card/70 px-3 py-1.5 text-[11px] tracking-wide text-muted-foreground sm:mb-7">
            <span className="size-1.5 rounded-full bg-primary" />
            YOUR PHOTOS, WITH MORE POSSIBILITY
          </div>
          <h1 className="max-w-[620px] text-[clamp(3rem,10vw,6.65rem)] font-normal leading-[0.94] tracking-[-0.075em] text-foreground">
            Keep the
            <br />
            moment.
            <br />
            <span className="font-[family-name:var(--font-heading)] font-normal italic text-primary dark:text-sidebar-primary">
              Change the
            </span>
            <br />
            <span className="font-[family-name:var(--font-heading)] font-normal italic text-primary dark:text-sidebar-primary">
              feeling.
            </span>
          </h1>
          <p className="mt-6 max-w-[410px] text-[15px] leading-7 text-muted-foreground sm:mt-7">
            A home for the photos you love, with a little AI magic to help you
            imagine them differently.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="group flex items-center gap-3 rounded-md bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Make room for magic
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-2 px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See it in action
              <ArrowDown className="size-3.5" />
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-[11px] text-muted-foreground sm:mt-10">
            <span className="flex -space-x-2">
              {["#d7c8bf", "#b8c5c6", "#d9d8eb"].map((color, index) => (
                <span
                  key={color}
                  className="size-6 rounded-full border-2 border-background"
                  style={{ backgroundColor: color, zIndex: 3 - index }}
                />
              ))}
            </span>
            <span>A calmer place for your camera roll</span>
          </div>
        </motion.div>

        <div id="demo" className="scroll-mt-24">
          <ProductDemo />
        </div>
      </div>
      <div className="relative mx-auto flex max-w-7xl items-center gap-4 border-t border-border px-5 py-4 text-[10px] uppercase tracking-[0.19em] text-muted-foreground sm:px-8 lg:px-12">
        <span className="size-1.5 rounded-full bg-primary" />
        A little less scrolling. A little more seeing.
        <span className="ml-auto hidden sm:inline">Your story, still yours.</span>
      </div>
    </section>
  );
}
