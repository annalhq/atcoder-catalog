import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { CategoryLink } from "@/components/category-link";
import { DifficultyBar } from "@/components/difficulty-bar";
import { ProblemBrowser } from "@/components/problem-browser";
import { Reveal } from "@/components/reveal";
import { getBands, getCategorySlugs, getCount, getProblems } from "@/lib/catalog";
import { PRACTICE, findCategory } from "@/lib/categories";

// Every category is prerendered at build time and unknown slugs 404, so no
// request ever reaches the data layer.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  return category ? { title: category.node.title } : {};
}

export default async function CategoryPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const category = findCategory(slug);
  const rows = getProblems(slug);
  if (!category || !rows) notFound();

  const { node, ancestors } = category;
  const subtopics = (node.children ?? []).flatMap((child) => {
    const count = getCount(child.slug);
    return count > 0 ? [{ ...child, count }] : [];
  });

  return (
    <main className="shell pt-12 pb-24">
      <Reveal>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-mute">
        <Link href="/" className="hover:text-ink">
          Categories
        </Link>
        {ancestors.map((ancestor) => (
          <Fragment key={ancestor.slug}>
            <span className="text-stone">/</span>
            <CategoryLink href={`/${ancestor.slug}`} className="hover:text-ink">
              {ancestor.title}
            </CategoryLink>
          </Fragment>
        ))}
      </nav>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-[32px] leading-[1.17] font-medium tracking-[0.2px] text-ink sm:text-[44px]">
          {node.title}
        </h1>
        <div className="flex items-center gap-3">
          <DifficultyBar bands={getBands(slug)} className="flex w-32" />
          <p className="text-sm text-mute tabular-nums">{rows.length.toLocaleString("en-US")} problems</p>
        </div>
      </div>
      {slug === PRACTICE.slug && (
        <p className="mt-3 max-w-xl text-base text-mute">
          A long progression of problems in the order they were practiced — work through it top to bottom.
        </p>
      )}

      {subtopics.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {subtopics.map((sub) => (
            <CategoryLink
              key={sub.slug}
              href={`/${sub.slug}`}
              className="inline-flex h-8 items-center gap-2 rounded-full border border-hairline px-3 text-sm text-body hover:bg-elevated hover:text-ink"
            >
              {sub.title}
              <span className="text-[13px] text-ash tabular-nums">{sub.count}</span>
            </CategoryLink>
          ))}
        </div>
      )}
      </Reveal>

      <Reveal delay={0.1}>
        <ProblemBrowser rows={rows} ladder={slug === PRACTICE.slug} />
      </Reveal>
    </main>
  );
}
