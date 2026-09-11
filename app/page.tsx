import { BracketCount } from "@/components/bracket-count";
import { HeroTitle, type HeroTopic } from "@/components/hero-title";
import { Rise } from "@/components/rise";
import { HeroActions } from "@/components/hero-actions";
import { TopicAccordion } from "@/components/topic-accordion";
import { getCount, getCountedTree, getMedianDifficulty, getUniqueProblemCount } from "@/lib/catalog";
import { PRACTICE, type CountedNode } from "@/lib/categories";

const HERO_TOPICS: [slug: string, label: string][] = [
  ["greedy", "Greedy"],
  ["segment_tree", "Segment Trees"],
  ["dp_bitmask", "Bitmask DP"],
  ["binary_search", "Binary Search"],
  ["flows", "Network Flows"],
  ["nt", "Number Theory"],
  ["shortest_path", "Shortest Paths"],
  ["game_theory", "Game Theory"],
  ["dp_digit", "Digit DP"],
  ["probability", "Probability"],
  ["strings", "Strings"],
  ["geometry", "Geometry"],
];

export default function Home() {
  const tree = getCountedTree();
  const topics = countNodes(tree);
  const problems = getUniqueProblemCount();
  const heroTopics: HeroTopic[] = HERO_TOPICS.filter(([slug]) => getCount(slug) > 0).map(([slug, label]) => ({
    slug,
    label,
    count: getCount(slug),
    median: getMedianDifficulty(slug),
  }));

  return (
    <>
      <section className="hero-frame relative w-full">
        <div className="surface-card hero-card relative flex w-full items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(255,255,255,0.07),transparent_60%)] dark:block" />
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2 select-none font-runde text-[28rem] leading-none font-bold text-black opacity-[0.04] dark:text-white dark:opacity-[0.05]"
          >
            A
          </span>

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pt-28 pb-20 text-center sm:gap-4 sm:px-6">
            <HeroTitle topics={heroTopics} />
            <Rise index={2}>
              <p className="max-w-xl font-medium text-black/60 sm:text-lg dark:text-white/60">
                Curated AtCoder problems sorted by technique & difficulty</p>
            </Rise>
            <Rise index={3}>
              <HeroActions
                primary={{ href: `/${PRACTICE.slug}`, label: "Start the practice ladder" }}
                secondary={{
                  href: "/#topics",
                  label: (
                    <>
                      Browse {topics} topics
                      <span className="hidden font-medium tabular-nums opacity-50 sm:inline">
                        {problems.toLocaleString("en-US")} problems
                      </span>
                    </>
                  ),
                }}
              />
            </Rise>
          </div>
        </div>
      </section>

      <section
        id="topics"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-[var(--frame-gap)] py-20 sm:py-24 md:py-32"
      >
        <header className="flex flex-col items-center gap-3 px-4 text-center">
          <h2 className="max-w-2xl text-balance font-runde text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {topics} topics, sorted by technique
          </h2>
          <p className="max-w-lg text-balance text-sm font-medium text-muted-foreground sm:text-base">
            Every topic lists its problems newest first, coloured by AtCoder difficulty. Expand a topic to see its
            subtopics
            <span className="hidden [@media(hover:hover)]:inline">
              , or press <BracketCount value="/" /> to search
            </span>
            .
          </p>
        </header>

        <div className="mt-12">
          <TopicAccordion tree={tree} />
        </div>
      </section>
    </>
  );
}

function countNodes(nodes: CountedNode[]): number {
  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
}
