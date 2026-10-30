"use client";

import { motion } from "motion/react";
import { ArrowDown, Layers3, Sparkles, WandSparkles } from "lucide-react";

const features = [
  {
    number: "01",
    icon: <Layers3 className="size-[17px]" />,
    title: "Your photos, in their place",
    description:
      "Bring the moments scattered across your camera roll into one thoughtful little home.",
  },
  {
    number: "02",
    icon: <WandSparkles className="size-[17px]" />,
    title: "A new scene, one sentence",
    description:
      "Describe the backdrop you have in mind and see your photo in a whole new light.",
  },
  {
    number: "03",
    icon: <Sparkles className="size-[17px]" />,
    title: "Your idea, made visible",
    description:
      "From a subtle retouch to a bold new look, a few words can take you somewhere unexpected.",
  },
];

function FeatureCard({
  number,
  icon,
  title,
  description,
}: (typeof features)[number]) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5 }}
      className="group border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-card sm:p-7"
    >
      <div className="mb-10 flex items-center justify-between">
        <span className="text-xs tabular-nums text-muted-foreground">{number}</span>
        <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary transition-transform group-hover:scale-105 dark:text-sidebar-primary">
          {icon}
        </span>
      </div>
      <h3 className="text-[17px] font-medium tracking-[-0.03em] text-card-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-[13px] leading-6 text-muted-foreground">
        {description}
      </p>
    </motion.article>
  );
}

export function StoryIntro() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 border-y border-border bg-muted/40"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[0.7fr_1.3fr] md:items-end lg:px-12 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-primary dark:text-sidebar-primary">
            Your creative corner
          </p>
          <h2 className="max-w-md text-4xl font-normal leading-[1.06] tracking-[-0.065em] text-foreground sm:text-5xl">
            A photo library with room to play.
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end"
        >
          Picto brings your favorite photos together, keeps them easy to find,
          and gives you simple tools to turn “what if?” into a whole new point of
          view.
        </motion.p>
      </div>
    </section>
  );
}

export function FeatureSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-primary dark:text-sidebar-primary">
            A few ways to begin
          </p>
          <h2 className="text-4xl font-normal tracking-[-0.06em] text-foreground sm:text-5xl">
            Small changes. New stories.
          </h2>
        </div>
        <a
          href="#transformations"
          className="group mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Explore the AI tools
          <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.number} {...feature} />
        ))}
      </div>
    </section>
  );
}
