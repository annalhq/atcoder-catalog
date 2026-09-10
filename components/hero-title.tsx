"use client";

import { AnimatePresence, m, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { bandColor, difficultyBand } from "@/lib/difficulty";
import { CategoryLink } from "./category-link";
import { ease } from "./motion-provider";

export type HeroTopic = { slug: string; label: string; count: number; median: number };

const ROTATE_MS = 2800;

const word: Variants = {
  show: { transition: { staggerChildren: 0.03 } },
  exit: { transition: { staggerChildren: 0.012 } },
};

const letter: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(12px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  exit: { opacity: 0, y: "-0.35em", filter: "blur(8px)", transition: { duration: 0.22, ease } },
};

/**
 * The headline's middle line cycles through real topics, letter by letter,
 * each tinted with the AtCoder colour of that topic's median difficulty.
 */
export function HeroTitle({ topics }: { topics: HeroTopic[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % topics.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [reduceMotion, paused, topics.length]);

  const topic = topics[index];
  const { band, fill } = difficultyBand(topic.median);
  const color = bandColor(band);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <h1
        aria-label="Get good at competitive programming, one topic at a time."
        className="font-display text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] text-ink sm:text-[64px] lg:text-[80px]"
      >
        <Line delay={0}>Get good at</Line>
        <span
          aria-hidden
          className="relative block h-[1.2em] overflow-hidden transition-colors duration-700"
          style={{ color }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={topic.slug}
              variants={word}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute inset-x-0 top-0 whitespace-nowrap"
            >
              {Array.from(topic.label, (char, i) => (
                <m.span key={i} variants={letter} className="inline-block whitespace-pre">
                  {char}
                </m.span>
              ))}
            </m.span>
          </AnimatePresence>
        </span>
        <Line delay={0.15} className="text-ash">
          one topic at a time.
        </Line>
      </h1>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease }}
        className="mt-6"
      >
        <CategoryLink
          href={`/${topic.slug}`}
          className="inline-flex items-center gap-2.5 rounded-full bg-surface px-3 py-1 text-[13px] tracking-[0.1px] text-mute ring-1 ring-hairline hover:text-ink"
        >
          <span
            className="size-2.5 rounded-full border transition-colors duration-700"
            style={{
              borderColor: color,
              background: `linear-gradient(to top, ${color} ${fill}%, transparent ${fill}%)`,
            }}
          />
          <span className="tabular-nums">{topic.count} problems</span>
          <span className="text-stone">·</span>
          <span>
            median difficulty{" "}
            <span className="tabular-nums transition-colors duration-700" style={{ color }}>
              {topic.median}
            </span>
          </span>
          <span aria-hidden>→</span>
        </CategoryLink>
      </m.div>
    </div>
  );
}

function Line({ children, delay, className = "" }: { children: ReactNode; delay: number; className?: string }) {
  return (
    <m.span
      aria-hidden
      className={`block ${className}`}
      initial={{ opacity: 0, y: "0.3em", filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </m.span>
  );
}
