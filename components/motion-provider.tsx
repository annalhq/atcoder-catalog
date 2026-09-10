"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export const SPRING = { type: "spring", stiffness: 300, damping: 22 } as const;
export const EASE = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
