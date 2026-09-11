import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { BracketCount } from "@/components/bracket-count";
import { CategoryLink } from "@/components/category-link";
import { ProblemBrowser } from "@/components/problem-browser";
import { Rise } from "@/components/rise";
import { getCategorySlugs, getCount, getProblems } from "@/lib/catalog";
import { PRACTICE, findCategory } from "@/lib/categories";

// every category is prerendered at build time and unknown slugs 404
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
  const ladder = slug === PRACTICE.slug;
  const subtopics = (node.children ?? []).flatMap((child) => {
    const count = getCount(child.slug);
    return count > 0 ? [{ ...child, count }] : [];
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-[var(--frame-gap)] pt-28 pb-16 sm:pt-32 md:pt-40">
      <header className="flex flex-col items-center gap-3 px-4 text-center">
        <Rise index={0}>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <Link href="/#topics" className="transition-colors duration-150 ease-out hover:text-foreground">
              Topics
            </Link>
            {ancestors.map((ancestor) => (
              <Fragment key={ancestor.slug}>
                <span className="text-accent">/</span>
                <CategoryLink
                  href={`/${ancestor.slug}`}
                  className="transition-colors duration-150 ease-out hover:text-foreground"
                >
                  {ancestor.title}
                </CategoryLink>
              </Fragment>
            ))}
          </nav>
        </Rise>
        <Rise index={1}>
          <h1 className="max-w-3xl text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {node.title} <BracketCount value={rows.length} className="text-2xl font-semibold sm:text-3xl" />
          </h1>
        </Rise>
        <Rise index={2}>
          <p className="max-w-lg text-balance text-sm font-medium text-muted-foreground sm:text-base">
            {ladder
              ? "A long progression of problems in the order they were practiced. Work through it top to bottom."
              : "Enter your AtCoder username to mark what you have solved. Filter by contest, difficulty or status."}
          </p>
        </Rise>

        {subtopics.length > 0 && (
          <Rise index={3} className="mt-2 flex flex-wrap justify-center gap-2">
            {subtopics.map((sub) => (
              <CategoryLink
                key={sub.slug}
                href={`/${sub.slug}`}
                className="surface-card inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground/70 transition-colors duration-150 ease-out hover:text-foreground dark:hover:bg-muted"
              >
                {sub.title}
                <span className="text-xs text-muted-foreground tabular-nums">{sub.count}</span>
              </CategoryLink>
            ))}
          </Rise>
        )}
      </header>

      <Rise index={4} className="mt-8 sm:mt-12">
        <ProblemBrowser rows={rows} ladder={ladder} />
      </Rise>
    </main>
  );
}
