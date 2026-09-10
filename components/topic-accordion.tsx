"use client";

import { AnimatePresence, m, type Variants } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { CountedNode } from "@/lib/categories";
import { CategoryLink } from "./category-link";
import { DifficultyBar } from "./difficulty-bar";
import { ease } from "./motion-provider";

const list: Variants = {
  open: { transition: { staggerChildren: 0.022, delayChildren: 0.04 } },
};

const item: Variants = {
  closed: { opacity: 0, y: -4 },
  open: { opacity: 1, y: 0, transition: { duration: 0.25, ease } },
};

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
  const visible = useMemo(
    () => (needle ? tree.flatMap((node) => prune(node, needle)) : tree),
    [tree, needle],
  );

  const expandable = tree.filter((node) => node.children.length > 0);
  const allOpen = expandable.every((node) => open.has(node.slug));

  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });

  // Two independent columns, so opening a topic never shifts the other side.
  const half = Math.ceil(visible.length / 2);
  const columns = [visible.slice(0, half), visible.slice(half)].filter((column) => column.length > 0);

  return (
    <>
      <div className="flex items-center gap-2">
        <label className="relative block flex-1">
          <span className="sr-only">Search topics</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ash"
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
            className="h-11 w-full rounded-md border border-hairline bg-elevated pr-12 pl-11 text-base text-white outline-none placeholder:text-ash focus:border-hairline-strong [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="keycap pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">/</kbd>
        </label>
        <button
          type="button"
          disabled={needle !== ""}
          onClick={() => setOpen(allOpen ? new Set() : new Set(expandable.map((node) => node.slug)))}
          className="h-11 shrink-0 rounded-md px-4 text-sm font-medium tracking-[0.2px] text-body hover:text-ink disabled:text-ash"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {columns.length > 0 ? (
        <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
          {columns.map((column) => (
            <div key={column[0].slug} className="overflow-hidden rounded-lg border border-hairline bg-surface">
              {column.map((node) => (
                <TopicItem
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
        <p className="py-16 text-center text-sm text-mute">No topics match “{query.trim()}”.</p>
      )}
    </>
  );
}

/** Keeps a node if it matches, or just the descendants that do. */
function prune(node: CountedNode, needle: string): CountedNode[] {
  if (node.title.toLowerCase().includes(needle)) return [node];
  const children = node.children.flatMap((child) => prune(child, needle));
  return children.length > 0 ? [{ ...node, children }] : [];
}

function TopicItem({ node, open, onToggle }: { node: CountedNode; open: boolean; onToggle: () => void }) {
  const panelId = useId();
  const expandable = node.children.length > 0;
  const subtopics = node.children.reduce((sum, child) => sum + 1 + child.children.length, 0);

  const header = (
    <>
      {expandable ? (
        <m.svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className="shrink-0 text-mute"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25, ease }}
        >
          <path d="m5 3 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </m.svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0 text-stone">
          <path d="M3 7h8m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="min-w-0 flex-1 truncate text-base leading-[1.4] font-medium tracking-[0.2px] text-ink">
        {node.title}
      </span>
      {expandable && <span className="hidden text-[13px] text-ash sm:inline">{subtopics} subtopics</span>}
      <DifficultyBar bands={node.bands} className="hidden w-20 md:flex" />
      <span className="w-12 text-right text-[13px] text-mute tabular-nums">{node.count}</span>
    </>
  );
  const headerClass = "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-elevated";

  return (
    <div className="border-b border-hairline last:border-b-0">
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
          <m.div
            key="panel"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease }}
            className="overflow-hidden"
          >
            <m.ul variants={list} initial="closed" animate="open" className="px-2 pb-2 pl-8">
              <Item>
                <TopicRow slug={node.slug} title="All problems" count={node.count} strong />
              </Item>
              {node.children.map((child) => (
                <Item key={child.slug}>
                  <TopicRow slug={child.slug} title={child.title} count={child.count} />
                  {child.children.length > 0 && (
                    <ul className="ml-3 border-l border-hairline pl-1.5">
                      {child.children.map((grandchild) => (
                        <Item key={grandchild.slug}>
                          <TopicRow slug={grandchild.slug} title={grandchild.title} count={grandchild.count} />
                        </Item>
                      ))}
                    </ul>
                  )}
                </Item>
              ))}
            </m.ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Item({ children }: { children: ReactNode }) {
  return <m.li variants={item}>{children}</m.li>;
}

function TopicRow({ slug, title, count, strong }: { slug: string; title: string; count: number; strong?: boolean }) {
  return (
    <CategoryLink
      href={`/${slug}`}
      className={`flex items-center gap-3 rounded-sm px-2.5 py-1.5 text-sm hover:bg-card hover:text-ink ${
        strong ? "font-medium text-ink" : "text-body"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <span className="text-[13px] text-ash tabular-nums">{count}</span>
    </CategoryLink>
  );
}
