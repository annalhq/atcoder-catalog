"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { SPRING } from "./motion-provider";

const STEP = 0.09;

/** rare-ui's hero entrance: rise out of a blur, staggered by index */
export function Rise({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { y: 18, filter: "blur(4px)", opacity: 0 }}
      animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { ...SPRING, delay: index * STEP }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
