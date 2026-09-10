"use client";

import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { m } from "motion/react";
import { difficultyBand } from "@/lib/difficulty";
import { contestFamily, problemUrl, type ContestFamily, type ProblemRow } from "@/lib/problem";
import { clearUser, selectUser, useSubmissions } from "@/lib/submissions";
import { ease } from "./motion-provider";

type Sort = "ladder" | "newest" | "oldest" | "easiest" | "hardest" | "random";
type Status = "all" | "unsolved" | "solved" | "attempted" | "untried";
type Contest = ContestFamily | "all";

const CONTESTS: [Contest, string][] = [
  ["all", "All"],
  ["abc", "ABC"],
  ["arc", "ARC"],
  ["agc", "AGC"],
  ["other", "Other"],
];

const STATUSES: [Status, string][] = [
  ["all", "Any status"],
  ["unsolved", "Unsolved"],
  ["solved", "Solved"],
  ["attempted", "Attempted"],
  ["untried", "Not attempted"],
];

// Rows are rendered in batches as the list scrolls into view, so large
// categories (the ladder has ~3,500) stay light in HTML and in the DOM.
const RENDER_STEP = 200;

const pillClass = (active: boolean) =>
  `h-7 rounded-full px-2.5 text-sm transition-colors ${
    active ? "bg-elevated text-white ring-1 ring-hairline" : "text-body hover:text-ink"
  }`;

export function ProblemBrowser({ rows, ladder }: { rows: ProblemRow[]; ladder: boolean }) {
  const { user, verdicts, loading, error } = useSubmissions();
  const [contest, setContest] = useState<Contest>("all");
  const [sort, setSort] = useState<Sort>(ladder ? "ladder" : "newest");
  const [seed, setSeed] = useState(0);
  const [status, setStatus] = useState<Status>("all");
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [showDifficulty, setShowDifficulty] = useState(true);
  const min = useDeferredValue(minInput);
  const max = useDeferredValue(maxInput);

  const contests = useMemo(() => {
    const present = new Set(rows.map(([id]) => contestFamily(id)));
    return CONTESTS.filter(([value]) => value === "all" || present.has(value));
  }, [rows]);

  const sorted = useMemo(() => sortRows(rows, sort, seed), [rows, sort, seed]);

  // Contest + difficulty filters; progress is measured against this set.
  const scoped = useMemo(() => {
    const lo = parseBound(min, 0);
    const hi = parseBound(max, Infinity);
    return sorted.filter(
      ([id, , , , difficulty]) =>
        (contest === "all" || contestFamily(id) === contest) && difficulty >= lo && difficulty <= hi,
    );
  }, [sorted, contest, min, max]);

  const visible = useMemo(
    () => (status === "all" ? scoped : scoped.filter(([id]) => matchesStatus(verdicts?.[id], status))),
    [scoped, status, verdicts],
  );

  const progress = useMemo(() => {
    if (!verdicts) return null;
    let solved = 0;
    let attempted = 0;
    for (const [id] of scoped) {
      if (verdicts[id] === "AC") solved++;
      else if (verdicts[id]) attempted++;
    }
    return { solved, attempted, total: scoped.length };
  }, [scoped, verdicts]);

  const [limit, setLimit] = useState(RENDER_STEP);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visible.length > limit;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLimit((n) => n + RENDER_STEP);
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  const shuffle = () => {
    setSeed(Math.floor(Math.random() * 2 ** 31));
    setSort("random");
  };

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <UserForm user={user} loading={loading} />
        <div className="flex items-center gap-3 text-[13px] tracking-[0.1px] text-mute">
          {progress && progress.total > 0 && (
            <span className="hidden h-1 w-24 overflow-hidden rounded-full bg-elevated sm:block">
              <m.span
                className="block h-full rounded-full bg-accent-green"
                initial={false}
                animate={{ width: `${(progress.solved / progress.total) * 100}%` }}
                transition={{ duration: 0.6, ease }}
              />
            </span>
          )}
          <p>
          {error ? (
            <span className="text-accent-red">{error}</span>
          ) : !user ? (
            "Add your AtCoder username to track progress."
          ) : progress ? (
            <>
              Solved <span className="text-ink">{progress.solved}</span> / {progress.total}
              <span className="px-2 text-stone">·</span>
              Attempted <span className="text-ink">{progress.attempted}</span>
              {loading && <span className="text-ash"> · syncing…</span>}
            </>
          ) : (
            loading && "Loading submissions…"
          )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
        <div className="flex items-center gap-1" role="group" aria-label="Contest">
          {contests.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={contest === value}
              onClick={() => setContest(value)}
              className={pillClass(contest === value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="mx-1 hidden h-5 w-px bg-hairline sm:block" />
        <Select label="Sort" value={sort} onChange={(v) => (v === "random" ? shuffle() : setSort(v))}>
          {ladder && <option value="ladder">Ladder order</option>}
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="easiest">Easiest first</option>
          <option value="hardest">Hardest first</option>
          <option value="random">Random</option>
        </Select>
        {sort === "random" && (
          <button
            type="button"
            onClick={shuffle}
            className="h-9 rounded-md bg-elevated px-3 text-sm font-medium tracking-[0.2px] text-ink hover:bg-card"
          >
            Reshuffle
          </button>
        )}
        <Select label="Status" value={status} onChange={setStatus} disabled={!verdicts}>
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <div className="flex items-center gap-1.5">
          <DifficultyInput label="Minimum difficulty" placeholder="Min" value={minInput} onChange={setMinInput} />
          <span className="text-ash">–</span>
          <DifficultyInput label="Maximum difficulty" placeholder="Max" value={maxInput} onChange={setMaxInput} />
        </div>
        <button
          type="button"
          aria-pressed={!showDifficulty}
          onClick={() => setShowDifficulty((shown) => !shown)}
          className={pillClass(!showDifficulty)}
        >
          Hide difficulty
        </button>
      </div>

      <div
        className="mt-4 rounded-lg border border-hairline bg-surface p-1.5"
        data-hide-difficulty={showDifficulty ? undefined : ""}
      >
        <div className="problem-row text-xs tracking-[0.4px] text-ash" aria-hidden>
          <span>#</span>
          <span>Task</span>
          <span>Title</span>
          <span className="diff-value">Difficulty</span>
          <span />
        </div>
        {/* Keyed by the filters so each new result set fades in. */}
        <m.div
          key={`${contest}|${sort}|${seed}|${status}|${min}|${max}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          {visible.slice(0, limit).map((row, i) => (
            <Row key={row[0]} row={row} n={i + 1} verdict={verdicts?.[row[0]]} />
          ))}
          {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden />}
        </m.div>
        {visible.length === 0 && (
          <p className="px-3 py-12 text-center text-sm text-mute">No problems match these filters.</p>
        )}
      </div>
    </section>
  );
}

const Row = memo(function Row({ row, n, verdict }: { row: ProblemRow; n: number; verdict?: string }) {
  const [id, , , title, difficulty] = row;
  const { band, fill } = difficultyBand(difficulty);
  return (
    <a
      href={problemUrl(row)}
      target="_blank"
      rel="noreferrer"
      className="problem-row"
      data-band={band}
      data-verdict={verdict === "AC" ? "ac" : undefined}
    >
      <span className="text-ash">{n}</span>
      <span className="truncate font-mono text-[13px] uppercase text-mute">{id}</span>
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="diff-dot" style={{ "--fill": `${fill}%` } as CSSProperties} />
        <span className="problem-title truncate">
          <Title text={title} />
        </span>
      </span>
      <span className="diff-value">{difficulty}</span>
      <span className="text-right">{verdict && <span className="verdict">{verdict}</span>}</span>
    </a>
  );
});

/** A few AtCoder titles use <s> for strikethrough; everything else is plain text. */
function Title({ text }: { text: string }) {
  if (!text.includes("<s>")) return text;
  return text.split(/<s>(.*?)<\/s>/).map((part, i) => (i % 2 ? <s key={i}>{part}</s> : part));
}

function UserForm({ user, loading }: { user: string | null; loading: boolean }) {
  // null mirrors the stored user, so a username restored after hydration shows up.
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? user ?? "";

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const name = value.trim();
        if (!name) {
          clearUser();
          setDraft(null);
        } else if (selectUser(name, { force: true })) {
          setDraft(null);
        }
      }}
    >
      <input
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="AtCoder username"
        aria-label="AtCoder username"
        autoComplete="off"
        spellCheck={false}
        className="h-9 w-48 rounded-md border border-hairline bg-elevated px-3 text-sm text-white outline-none placeholder:text-ash focus:border-hairline-strong"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-9 rounded-md bg-white px-4 text-sm font-medium tracking-[0.2px] text-black active:bg-primary-pressed disabled:bg-elevated disabled:text-ash"
      >
        {loading ? "Syncing" : "Fetch"}
      </button>
    </form>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-9 appearance-none rounded-md border border-hairline bg-elevated pr-8 pl-3 text-sm text-white outline-none focus:border-hairline-strong disabled:text-ash"
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-mute"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path d="M3 4.5 6 7.5l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </label>
  );
}

function DifficultyInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      step={100}
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-20 rounded-md border border-hairline bg-elevated px-3 text-sm text-white tabular-nums outline-none placeholder:text-ash focus:border-hairline-strong"
    />
  );
}

function sortRows(rows: ProblemRow[], sort: Sort, seed: number): ProblemRow[] {
  if (sort === "ladder") return rows;
  if (sort === "random") return shuffled(rows, seed);

  const newest = (a: ProblemRow, b: ProblemRow) => b[5] - a[5] || compareIndex(a, b);
  const compare = {
    newest,
    oldest: (a: ProblemRow, b: ProblemRow) => a[5] - b[5] || compareIndex(a, b),
    easiest: (a: ProblemRow, b: ProblemRow) => a[4] - b[4] || newest(a, b),
    hardest: (a: ProblemRow, b: ProblemRow) => b[4] - a[4] || newest(a, b),
  }[sort];
  return [...rows].sort(compare);
}

// "Ex" was ABC's name for the eighth task, so it sorts where "H" would.
const indexKey = (index: string) => (index === "Ex" ? "H" : index);

function compareIndex(a: ProblemRow, b: ProblemRow) {
  return indexKey(a[2]).localeCompare(indexKey(b[2]), "en", { numeric: true });
}

/** Deterministic Fisher–Yates (mulberry32) so rendering stays pure for a given seed. */
function shuffled<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed >>> 0;
  const random = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function parseBound(value: string, fallback: number) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function matchesStatus(verdict: string | undefined, status: Status) {
  switch (status) {
    case "solved":
      return verdict === "AC";
    case "unsolved":
      return verdict !== "AC";
    case "attempted":
      return verdict !== undefined && verdict !== "AC";
    case "untried":
      return verdict === undefined;
    default:
      return true;
  }
}
