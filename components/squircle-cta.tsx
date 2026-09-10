"use client";

import { useState, type ReactNode } from "react";
import { Squircle } from "@squircle-js/react";
import { motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";
import { CategoryLink } from "./category-link";
import { SPRING } from "./motion-provider";

const GROW_PX = 18;
const SIDE_SHIFT = GROW_PX / 2;

function StretchSquircleBg({ hovered, bgClassName }: { hovered: boolean; bgClassName: string }) {
  const reduceMotion = useReducedMotion();
  const [ref, bounds] = useMeasure();
  const scaleX = hovered && !reduceMotion && bounds.width > 0 ? (bounds.width + GROW_PX) / bounds.width : 1;

  return (
    <motion.div ref={ref} initial={false} animate={{ scaleX }} transition={SPRING} className="absolute inset-0">
      <Squircle asChild cornerRadius={16} cornerSmoothing={1}>
        <div className={cn("size-full", bgClassName)} />
      </Squircle>
    </motion.div>
  );
}

export type Cta = { href: string; label: ReactNode; primary?: boolean };

/** two squircle buttons that stretch on hover and nudge each other aside, from rare-ui's HeroCta */
export function SquircleCtaPair({ primary, secondary }: { primary: Cta; secondary: Cta }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<"a" | "b" | null>(null);
  const shift = (px: number) => (reduceMotion ? 0 : px);

  const items = [
    { key: "a" as const, cta: secondary, x: hovered === "b" ? shift(-SIDE_SHIFT) : 0 },
    { key: "b" as const, cta: primary, x: hovered === "a" ? shift(SIDE_SHIFT) : 0 },
  ];

  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
      {items.map(({ key, cta, x }) => (
        <motion.div
          key={key}
          initial={false}
          animate={{ x }}
          transition={SPRING}
          onHoverStart={() => setHovered(key)}
          onHoverEnd={() => setHovered((h) => (h === key ? null : h))}
          className="group relative shrink-0"
        >
          <StretchSquircleBg
            hovered={hovered === key}
            bgClassName={
              cta.primary
                ? "bg-accent transition-colors duration-150 ease-out group-hover:bg-accent-hover"
                : "bg-neutral-900 transition-colors duration-150 ease-out group-hover:bg-neutral-800"
            }
          />
          <CategoryLink
            href={cta.href}
            className="relative flex h-12 items-center gap-2 px-6 font-runde text-sm font-semibold text-white"
          >
            {cta.label}
          </CategoryLink>
        </motion.div>
      ))}
    </div>
  );
}
