import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { BracketCount } from "@/components/bracket-count";
import { CategoryLink } from "@/components/category-link";
import { Rise } from "@/components/rise";
import { getCategorySlugs, getUniqueProblemCount } from "@/lib/catalog";
import { PRACTICE } from "@/lib/categories";
import { bandColor } from "@/lib/difficulty";

export const metadata: Metadata = {
  title: "About",
  description: "What AtCat is, where its problems and difficulty ratings come from, and how progress tracking works.",
};

const BANDS = [
  ["Grey", "0 to 399"],
  ["Brown", "400 to 799"],
  ["Green", "800 to 1199"],
  ["Cyan", "1200 to 1599"],
  ["Blue", "1600 to 1999"],
  ["Yellow", "2000 to 2399"],
  ["Orange", "2400 to 2799"],
  ["Red", "2800 to 3199"],
  ["Bronze", "3200 to 3599"],
  ["Silver", "3600 to 3999"],
  ["Gold", "4000 and up"],
] as const;

const LINK =
  "text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 ease-out hover:decoration-accent";

export default function AboutPage() {
  const problems = getUniqueProblemCount();
  const topics = getCategorySlugs().filter((slug) => slug !== PRACTICE.slug).length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-[var(--frame-gap)] pt-28 pb-16 sm:pt-32 md:pt-40">
      <header className="flex flex-col items-center gap-3 px-4 text-center">
        <Rise index={0}>
          <h1 className="font-runde text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">About AtCat</h1>
        </Rise>
        <Rise index={1}>
          <p className="max-w-lg text-balance text-sm font-medium text-muted-foreground sm:text-base">
            Practice AtCoder by technique: <BracketCount value={problems} /> problems across{" "}
            <BracketCount value={topics} /> topics, with your progress pulled from AtCoder Problems.
          </p>
        </Rise>
      </header>

      <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:gap-4">
        <Section index={2} title="Why topics">
          <p>
            A problem&apos;s tags can spoil it: once you know it is a flow problem, half the work is done. AtCat groups
            AtCoder problems by the technique they need, so you can drill a weak area on purpose.
          </p>
          <p>
            Each topic lists its problems newest first. Filter by contest, difficulty or status, or shuffle them. Not
            sure where to start? The{" "}
            <CategoryLink href={`/${PRACTICE.slug}`} className={LINK}>
              practice ladder
            </CategoryLink>{" "}
            is a long progression of problems in the order they were practiced.
          </p>
        </Section>

        <Section index={3} title="Difficulty colours">
          <p>
            Difficulty is the AtCoder Problems estimate: roughly the rating at which a contestant has an even chance of
            solving the problem. The dot beside each problem takes AtCoder&apos;s rating colour and fills up as the
            difficulty climbs through its 400-point band.
          </p>
          <ul className="inset-panel mt-1 grid grid-cols-2 gap-1 rounded-3xl p-2 sm:grid-cols-3">
            {BANDS.map(([name, range], band) => (
              <li key={name} className="flex items-center gap-2.5 rounded-2xl px-3 py-2">
                <span
                  className="diff-dot"
                  data-metal={band >= 8 ? "" : undefined}
                  style={{ "--c": bandColor(band), "--fill": "60%" } as CSSProperties}
                />
                <span className="text-sm font-medium text-foreground">{name}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">{range}</span>
              </li>
            ))}
          </ul>
          <p>Rather not know? Hide difficulty on any topic page and it disappears from the list.</p>
        </Section>

        <Section index={4} title="Tracking your progress">
          <p>
            Enter your AtCoder username on any topic page. Your browser reads your submissions from the AtCoder
            Problems API and keeps them in local storage. There is no account, and nothing is sent to AtCat.
          </p>
          <p>
            The first sync of a long history can take a few seconds. After that, only new submissions are fetched.
            Solved problems get a green AC; attempted ones show your latest verdict.
          </p>
        </Section>

        <Section index={5} title="Credits">
          <ul className="flex flex-col gap-2">
            <Credit>
              Topic lists and problem sets from{" "}
              <a href="https://atcoder-categories.github.io" target="_blank" rel="noreferrer" className={LINK}>
                atcoder-categories
              </a>{" "}
              by npc0x0.
            </Credit>
            <Credit>
              Difficulty estimates and submission data from{" "}
              <a href="https://kenkoooo.com/atcoder/" target="_blank" rel="noreferrer" className={LINK}>
                AtCoder Problems
              </a>{" "}
              by kenkoooo.
            </Credit>
            <Credit>
              Design inspired by{" "}
              <a href="https://rareui.com" target="_blank" rel="noreferrer" className={LINK}>
                Rare UI
              </a>
              .
            </Credit>
            <Credit>
              Problems belong to{" "}
              <a href="https://atcoder.jp" target="_blank" rel="noreferrer" className={LINK}>
                AtCoder
              </a>
              . AtCat is not affiliated with AtCoder Inc.
            </Credit>
          </ul>
        </Section>
      </div>
    </main>
  );
}

function Section({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  return (
    <Rise index={index}>
      <section className="surface-card rounded-[28px] p-5 sm:rounded-[32px] sm:p-7">
        <h2 className="font-runde text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed font-medium text-foreground/70 sm:text-base">
          {children}
        </div>
      </section>
    </Rise>
  );
}

function Credit({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-foreground/40">•</span>
      <span>{children}</span>
    </li>
  );
}
