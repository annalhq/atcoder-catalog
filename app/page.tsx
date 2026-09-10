import { CategoryLink } from "@/components/category-link";
import { HeroTitle, type HeroTopic } from "@/components/hero-title";
import { Reveal } from "@/components/reveal";
import { TopicAccordion } from "@/components/topic-accordion";
import {
  getCount,
  getCountedTree,
  getMedianDifficulty,
  getUniqueProblemCount,
} from "@/lib/catalog";
import { PRACTICE, type CountedNode } from "@/lib/categories";

// Short labels so the rotating headline word fits on one line on phones.
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
  const ladderSize = getCount(PRACTICE.slug);
  const heroTopics: HeroTopic[] = HERO_TOPICS.filter(([slug]) => getCount(slug) > 0).map(
    ([slug, label]) => ({ slug, label, count: getCount(slug), median: getMedianDifficulty(slug) }),
  );

  return (
    <main>
      <section className="relative overflow-hidden">
        <div aria-hidden className="hero-stripes" />
        <div className="shell relative pt-20 pb-14 sm:pt-28">
          <HeroTitle topics={heroTopics} />
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-xl text-lg leading-[1.6] text-mute">
              Strengthen a weak area with curated AtCoder problems, without seeing every tag a problem carries.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {ladderSize > 0 && (
                <CategoryLink
                  href={`/${PRACTICE.slug}`}
                  className="inline-flex h-9 items-center rounded-md bg-white px-4 text-sm font-medium tracking-[0.2px] text-black active:bg-primary-pressed"
                >
                  Start the practice ladder
                </CategoryLink>
              )}
              <p className="text-sm text-mute">
                <span className="text-ink">{getUniqueProblemCount().toLocaleString("en-US")}</span> problems
                <span className="px-2 text-stone">·</span>
                <span className="text-ink">{countNodes(tree)}</span> topics
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal delay={0.4} className="shell pb-24">
        <TopicAccordion tree={tree} />
      </Reveal>
    </main>
  );
}

function countNodes(nodes: CountedNode[]): number {
  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
}
