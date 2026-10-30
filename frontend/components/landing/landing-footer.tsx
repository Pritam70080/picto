import Link from "next/link";
import { ChevronDown, ImagePlus } from "lucide-react";
import { transformationLinks } from "@/components/landing/data";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
              aria-label="Picto home"
            >
              <span className="grid size-8 place-items-center rounded-lg">
                <img src="/Picto.png" alt="Picto" />
              </span>
              <span className="text-[17px] font-semibold tracking-[-0.06em] text-foreground">
                picto<span className="text-primary dark:text-sidebar-primary">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-6 text-muted-foreground">
              A thoughtful home for your photos, and a little space to imagine
              what else they could be.
            </p>
          </div>

          <div className="md:justify-self-end md:text-right">
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              AI transformations
            </p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-left sm:grid-cols-3 md:justify-items-end">
              {transformationLinks.map((name) => (
                <li key={name}>
                  <a
                    href="#demo"
                    className="text-xs text-muted-foreground transition-colors hover:text-primary dark:hover:text-sidebar-primary"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Picto. Made for the moments that matter.
          </span>
          <a href="#top" className="inline-flex items-center gap-1 hover:text-foreground">
            Back to top <ChevronDown className="size-3 rotate-180" />
          </a>
        </div>
      </div>
    </footer>
  );
}
