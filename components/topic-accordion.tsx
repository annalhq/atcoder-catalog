"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { CountedNode } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { BracketCount } from "./bracket-count";
import { CategoryLink } from "./category-link";
import { EASE } from "./motion-provider";

const list: Variants = {
  open: { transition: { staggerChildren: 0.022, delayChildren: 0.04 } },
};

const item: Variants = {
  closed: { opacity: 0, y: -4 },
  open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
};

const CARD =
  "surface-card overflow-hidden rounded-[32px] transition-colors duration-200 ease-out dark:hover:bg-muted";

export function TopicAccordion({ tree }: { tree: CountedNode[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.target instanceof HTMLInputElement) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = useMemo(() => (needle ? tree.flatMap((node) => prune(node, needle)) : tree), [tree, needle]);

  const expandable = tree.filter((node) => node.children.length > 0);
  const allOpen = expandable.every((node) => open.has(node.slug));

  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });

  // two independent columns, so opening a topic never shifts the other side
  const half = Math.ceil(visible.length / 2);
  const columns = [visible.slice(0, half), visible.slice(half)].filter((column) => column.length > 0);

  return (
    <>
      <div className="mx-auto flex w-full max-w-xl items-center gap-2">
        <label className="relative block flex-1">
          <span className="sr-only">Search topics</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-foreground/40"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.5" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Escape") return;
              setQuery("");
              e.currentTarget.blur();
            }}
            placeholder="Search topics…"
            autoComplete="off"
            className="h-12 w-full rounded-full border border-black/[0.04] bg-[#F5F5F7] pr-4 pl-11 text-base font-medium sm:pr-12 sm:text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-accent/40 dark:border-transparent dark:border-apple dark:bg-[#121212] [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-md sm:block bg-popover px-1.5 py-0.5 font-mono text-[11px] text-foreground/50">
            /
          </kbd>
        </label>
        <button
          type="button"
          disabled={needle !== ""}
          onClick={() => setOpen(allOpen ? new Set() : new Set(expandable.map((node) => node.slug)))}
          className="h-12 shrink-0 rounded-full px-3 font-runde sm:px-4 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground disabled:opacity-40"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {columns.length > 0 ? (
        <div className="mt-10 grid items-start gap-4 lg:grid-cols-2">
          {columns.map((column) => (
            <div key={column[0].slug} className="flex flex-col gap-4">
              {column.map((node) => (
                <TopicCard
                  key={node.slug}
                  node={node}
                  open={needle !== "" || open.has(node.slug)}
                  onToggle={() => toggle(node.slug)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm font-medium text-muted-foreground">
          No topics match “{query.trim()}”.
        </p>
      )}
    </>
  );
}

/** keeps a node if it matches, or just the descendants that do */
function prune(node: CountedNode, needle: string): CountedNode[] {
  if (node.title.toLowerCase().includes(needle)) return [node];
  const children = node.children.flatMap((child) => prune(child, needle));
  return children.length > 0 ? [{ ...node, children }] : [];
}

function TopicCard({ node, open, onToggle }: { node: CountedNode; open: boolean; onToggle: () => void }) {
  const panelId = useId();
  const expandable = node.children.length > 0;
  const subtopics = node.children.reduce((sum, child) => sum + 1 + child.children.length, 0);

  const header = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2 font-runde text-base font-semibold tracking-tight sm:text-lg">
          <span className="truncate">{node.title}</span>
          <BracketCount value={node.count} className="shrink-0 font-sans text-sm font-medium" />
        </span>
        {expandable && (
          <span className="text-xs font-medium text-muted-foreground">
            {subtopics} subtopic{subtopics === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {expandable ? (
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="shrink-0 text-accent"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          aria-hidden
        >
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      )}
    </>
  );
  const headerClass = "group flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5";

  return (
    <section className={cn(CARD)}>
      {expandable ? (
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className={headerClass}>
          {header}
        </button>
      ) : (
        <CategoryLink href={`/${node.slug}`} className={headerClass}>
          {header}
        </CategoryLink>
      )}

      <AnimatePresence initial={false}>
        {expandable && open && (
          <motion.div
            key="panel"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <motion.ul
              variants={list}
              initial="closed"
              animate="open"
              className="squircle mx-2 mb-2 rounded-3xl border border-black/[0.06] bg-white p-2 dark:border-neutral-500/15 dark:bg-neutral-950"
            >
              <Item>
                <TopicRow slug={node.slug} title="All problems" count={node.count} strong />
              </Item>
              {node.children.map((child) => (
                <Item key={child.slug}>
                  <TopicRow slug={child.slug} title={child.title} count={child.count} />
                  {child.children.length > 0 && (
                    <ul className="ml-5 border-l border-border/60 pl-1">
                      {child.children.map((grandchild) => (
                        <Item key={grandchild.slug}>
                          <TopicRow slug={grandchild.slug} title={grandchild.title} count={grandchild.count} />
                        </Item>
                      ))}
                    </ul>
                  )}
                </Item>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Item({ children }: { children: ReactNode }) {
  return <motion.li variants={item}>{children}</motion.li>;
}

function TopicRow({ slug, title, count, strong }: { slug: string; title: string; count: number; strong?: boolean }) {
  return (
    <CategoryLink
      href={`/${slug}`}
      className={cn(
        "squircle flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors duration-150 ease-out hover:bg-card",
        strong ? "font-semibold text-foreground" : "font-medium text-foreground/60 hover:text-foreground",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
    </CategoryLink>
  );
}
