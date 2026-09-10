"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "./motion-provider";

/** Fades and lifts its content in on mount. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </m.div>
  );
}
