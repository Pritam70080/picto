"use client";

/* eslint-disable @next/next/no-img-element -- Demo photography is served from Unsplash. */
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Sparkles, WandSparkles } from "lucide-react";
import { treatments } from "@/components/landing/data";

export function ProductDemo() {
  const [selected, setSelected] = useState(0);
  const [prompt, setPrompt] = useState(treatments[0].prompt);
  const [previewed, setPreviewed] = useState(true);
  const treatment = treatments[selected];

  function chooseTreatment(index: number) {
    setSelected(index);
    setPrompt(treatments[index].prompt);
    setPreviewed(false);
  }

  function generatePreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPrompt = prompt.toLowerCase();
    const matchingTreatment = treatments.find((item) =>
      item.keywords.some((word) => normalizedPrompt.includes(word)),
    );
    if (matchingTreatment) {
      setSelected(treatments.indexOf(matchingTreatment));
    }
    setPreviewed(true);
  }

  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-5 top-[14%] z-0 h-px bg-cyan-300/80 shadow-[0_0_22px_5px_rgba(70,220,255,0.5)]"
        animate={{ y: [0, 170, 0], opacity: [0.2, 0.9, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-4 right-[17%] z-0 w-px bg-white/80 shadow-[0_0_18px_4px_rgba(130,150,255,0.6)]"
        animate={{ x: [0, -75, 0], opacity: [0.25, 0.85, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
        className="relative z-10 overflow-hidden rounded-[1.25rem] border border-border bg-card p-3 shadow-[0_28px_90px_-40px_rgba(31,42,79,0.32)] sm:p-4"
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary dark:text-sidebar-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">A little Picto magic</p>
              <p className="text-[11px] text-muted-foreground">Your photo, reimagined</p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
            LIVE PREVIEW
          </span>
        </div>

        <div className="relative grid aspect-[1.1/1] grid-cols-2 overflow-hidden rounded-lg bg-muted sm:aspect-[1.55/1]">
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85"
              alt="Original portrait before editing"
              className="size-full object-cover object-[center_38%]"
            />
            <span className="absolute bottom-3 left-3 rounded-sm bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              ORIGINAL
            </span>
          </div>
          <div className="relative overflow-hidden border-l-2 border-white">
            <AnimatePresence mode="wait">
              <motion.img
                key={`${treatment.name}-${previewed}`}
                src={treatment.image}
                alt={`${treatment.name} transformation preview`}
                initial={{ opacity: 0.45, scale: 1.035 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="size-full object-cover object-[center_38%]"
              />
            </AnimatePresence>
            <span className="absolute bottom-3 right-3 rounded-sm bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground backdrop-blur-sm">
              {previewed ? treatment.note : "READY TO PREVIEW"}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
            <div className="grid size-8 place-items-center rounded-full border border-border bg-background/90 text-foreground shadow-md">
              <ArrowRight className="size-4" />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {treatments.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => chooseTreatment(index)}
              aria-pressed={selected === index}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                selected === index
                  ? "border-primary/40 bg-primary/10 font-medium text-primary dark:text-sidebar-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <form
          onSubmit={generatePreview}
          className="mt-3 flex items-center gap-2 rounded-md border border-input bg-background p-1.5 pl-3"
        >
          <WandSparkles className="size-4 shrink-0 text-primary dark:text-sidebar-primary" />
          <input
            aria-label="Describe your photo transformation"
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setPreviewed(false);
            }}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Describe the change you imagine..."
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded bg-primary px-3 py-2 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Sparkles className="size-3" />
            Preview
          </button>
        </form>
        <p className="mt-2 px-1 text-[10px] text-muted-foreground">
          A tiny taste of what your photos could become.
        </p>
      </motion.div>
    </div>
  );
}
