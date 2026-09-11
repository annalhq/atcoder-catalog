"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CategoryLink } from "./category-link";
import { SPRING } from "./motion-provider";

type Action = { href: string; label: ReactNode };

const PILL =
  "group flex h-12 items-center gap-3 rounded-full font-runde text-sm font-semibold transition-colors duration-150 ease-out";

/** navbar-style pills: a solid primary with an orange arrow chip, and a quiet secondary */
export function HeroActions({ primary, secondary }: { primary: Action; secondary: Action }) {
  const reduceMotion = useReducedMotion();
  const press = reduceMotion ? {} : { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } };

  return (
    <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
      <motion.div {...press} transition={SPRING}>
        <CategoryLink
          href={primary.href}
          className={cn(PILL, "border-apple bg-neutral-900 pr-2 pl-5 text-white hover:bg-neutral-800")}
        >
          {primary.label}
          {/* 32px chip 8px inside a 48px pill keeps the two corners concentric */}
          <span className="flex size-8 items-center justify-center rounded-full bg-accent">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        </CategoryLink>
      </motion.div>

      <motion.div {...press} transition={SPRING}>
        <CategoryLink
          href={secondary.href}
          className={cn(
            PILL,
            "px-5 bg-black/[0.05] text-black/70 hover:text-black dark:bg-white/[0.07] dark:text-white/70 dark:hover:text-white",
          )}
        >
          {secondary.label}
        </CategoryLink>
      </motion.div>
    </div>
  );
}
