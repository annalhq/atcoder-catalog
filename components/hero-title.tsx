"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import { bandColor, difficultyBand } from "@/lib/difficulty";
import { CategoryLink } from "./category-link";
import { EASE } from "./motion-provider";
import { Rise } from "./rise";

export type HeroTopic = { slug: string; label: string; count: number; median: number };

const ROTATE_MS = 2800;

const word: Variants = {
  show: { transition: { staggerChildren: 0.03 } },
  exit: { transition: { staggerChildren: 0.012 } },
};

const letter: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(12px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
  exit: { opacity: 0, y: "-0.35em", filter: "blur(8px)", transition: { duration: 0.22, ease: EASE } },
};

/** the middle line cycles through real topics letter by letter, in the accent orange */
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
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="flex flex-col items-center gap-3 sm:gap-4"
    >
      <Rise index={0}>
        <h1
          aria-label="Get good at competitive programming, one topic at a time."
          className="max-w-4xl text-balance font-runde text-[2rem] leading-[1.05] min-[400px]:text-4xl font-bold tracking-tight text-black sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
        >
          <span aria-hidden className="block">
            Get good at
          </span>
          {/* invisible copies of every label size the line to the widest one, so no topic gets clipped */}
          <span
            aria-hidden
            className="-mb-[0.15em] grid justify-items-center overflow-hidden px-[0.1em] pb-[0.15em] text-accent"
          >
            {topics.map((t) => (
              <span key={t.slug} className="invisible whitespace-nowrap [grid-area:1/1]">
                {Array.from(t.label, (char, i) => (
                  <span key={i} className="inline-block whitespace-pre">
                    {char}
                  </span>
                ))}
              </span>
            ))}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={topic.slug}
                variants={word}
                initial="hidden"
                animate="show"
                exit="exit"
                className="whitespace-nowrap [grid-area:1/1]"
              >
                {Array.from(topic.label, (char, i) => (
                  <motion.span key={i} variants={letter} className="inline-block whitespace-pre">
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>
      </Rise>

      <Rise index={1}>
        <CategoryLink
          href={`/${topic.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium sm:gap-2.5 sm:px-3.5 sm:text-sm text-black/60 transition-colors duration-150 ease-out hover:text-black dark:bg-white/[0.07] dark:text-white/60 dark:hover:text-white"
        >
          <span
            className="size-2.5 rounded-full border transition-colors duration-700"
            style={{ borderColor: color, background: `linear-gradient(to top, ${color} ${fill}%, transparent ${fill}%)` }}
          />
          <span className="tabular-nums">{topic.count} problems</span>
          <span className="opacity-40">·</span>
          <span>
            median{" "}
            <span className="text-black tabular-nums dark:text-white">{topic.median}</span>
          </span>
        </CategoryLink>
      </Rise>
    </div>
  );
}
