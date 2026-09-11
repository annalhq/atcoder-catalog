import type { Metadata } from "next";
import CtaLink from "@/components/not-found/CtaLink";
import DodgingDigits from "@/components/not-found/DodgingDigits";
import { Rise } from "@/components/rise";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Browse the topics instead.",
};

export default function NotFound() {
  return (
    <section className="hero-frame relative w-full">
      <div className="surface-card hero-card relative flex w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(255,255,255,0.07),transparent_60%)] dark:block" />

        <div className="relative flex flex-col items-center justify-center gap-4 px-6 pt-28 pb-24 text-center sm:gap-5">
          <h1 className="sr-only">Page not found</h1>

          <Rise index={0} className="font-runde text-[6.5rem] leading-[0.85] font-bold tracking-tight sm:text-[9rem] lg:text-[12rem]">
            <DodgingDigits digits="404" accentIndex={1} />
          </Rise>

          <Rise index={1}>
            <p className="font-runde text-2xl font-bold tracking-tight text-black sm:text-3xl dark:text-white">
              No such topic.
            </p>
          </Rise>

          <Rise index={2}>
            <p className="max-w-md font-medium text-black/60 sm:text-lg dark:text-white/60">
              The link is broken or the topic moved. Every category is still right where you left it.
            </p>
          </Rise>

          <Rise index={3} className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
            <CtaLink href="/#topics" label="Browse topics" primary />
            <CtaLink href="/" label="Back home" />
          </Rise>
        </div>
      </div>
    </section>
  );
}
