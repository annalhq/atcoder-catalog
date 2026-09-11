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
import { motion } from "motion/react";
import { difficultyBand } from "@/lib/difficulty";
import { contestFamily, problemUrl, type ContestFamily, type ProblemRow } from "@/lib/problem";
import { clearUser, selectUser, useSubmissions } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import { EASE } from "./motion-provider";

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

// rows render in batches as the list scrolls so the ladder's ~3,500 stay light
const RENDER_STEP = 200;

const CONTROL =
  "flex h-9 shrink-0 items-center rounded-[12px] squircle bg-popover px-3 text-xs font-medium text-foreground shadow-sm";

// ios zooms into form fields under 16px, so they only shrink from sm up
const FIELD_TEXT = "text-base sm:text-xs";

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

  // contest + difficulty filters; progress is measured against this set
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
    // centred with a max width, so short titles do not leave a wall of space on one side
    <section className="surface-card mx-auto w-full max-w-4xl rounded-[28px] p-1.5 sm:rounded-[32px] sm:p-2">
      <div className="flex flex-col gap-3 px-2 pt-2 pb-3 sm:px-4 sm:pt-3 sm:pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <UserForm user={user} loading={loading} />
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            {progress && progress.total > 0 && (
              <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-black/[0.06] sm:block dark:bg-white/[0.08]">
                <motion.span
                  className="block h-full rounded-full bg-accent"
                  initial={false}
                  animate={{ width: `${(progress.solved / progress.total) * 100}%` }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </span>
            )}
            <p>
              {error ? (
                <span className="text-accent">{error}</span>
              ) : !user ? (
                "Add your AtCoder username to track progress."
              ) : progress ? (
                <>
                  Solved <span className="text-foreground">{progress.solved}</span> / {progress.total}
                  <span className="px-1.5 text-accent">·</span>
                  Attempted <span className="text-foreground">{progress.attempted}</span>
                  {loading && <span className="opacity-60"> · syncing…</span>}
                </>
              ) : (
                loading && "Loading submissions…"
              )}
            </p>
          </div>
        </div>

        {/* one swipeable strip on phones, wrapping rows from sm up */}
        <div className="no-scrollbar -mx-2 -my-1 flex items-center gap-2 overflow-x-auto px-2 py-1 sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0">
          <Segmented value={contest} onChange={setContest} options={contests} label="Contest" />
          <Select label="Sort" value={sort} onChange={(v) => (v === "random" ? shuffle() : setSort(v))}>
            {ladder && <option value="ladder">Ladder order</option>}
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="easiest">Easiest first</option>
            <option value="hardest">Hardest first</option>
            <option value="random">Random</option>
          </Select>
          {sort === "random" && (
            <button type="button" onClick={shuffle} className={cn(CONTROL, "cursor-pointer hover:text-accent")}>
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
          <div className={cn(CONTROL, "gap-1.5 px-2")}>
            <DifficultyInput label="Minimum difficulty" placeholder="Min" value={minInput} onChange={setMinInput} />
            <span className="text-foreground/30">–</span>
            <DifficultyInput label="Maximum difficulty" placeholder="Max" value={maxInput} onChange={setMaxInput} />
          </div>
          <button
            type="button"
            aria-pressed={!showDifficulty}
            onClick={() => setShowDifficulty((shown) => !shown)}
            className={cn(
              CONTROL,
              "cursor-pointer transition-colors",
              showDifficulty ? "text-foreground/60 hover:text-foreground" : "bg-accent text-white",
            )}
          >
            {showDifficulty ? "Hide difficulty" : "Show difficulty"}
          </button>
        </div>
      </div>

      <div
        className="inset-panel rounded-[22px] p-1.5 sm:rounded-3xl"
        data-hide-difficulty={showDifficulty ? undefined : ""}
      >
        <div
          className="problem-row min-h-0 py-2.5 text-[10px] font-medium tracking-wider text-foreground/45 uppercase"
          aria-hidden
        >
          <span>#</span>
          <span className="cell-code text-[10px]">Code</span>
          <span className="cell-title">Problem</span>
          <span className="cell-diff">Diff</span>
        </div>
        {/* keyed by the filters so each new result set fades in */}
        <motion.div
          key={`${contest}|${sort}|${seed}|${status}|${min}|${max}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {visible.slice(0, limit).map((row, i) => (
            <Row key={row[0]} row={row} n={i + 1} verdict={verdicts?.[row[0]]} />
          ))}
          {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden />}
        </motion.div>
        {visible.length === 0 && (
          <p className="px-3 py-12 text-center text-sm font-medium text-muted-foreground">
            No problems match these filters.
          </p>
        )}
      </div>
    </section>
  );
}

const Row = memo(function Row({ row, n, verdict }: { row: ProblemRow; n: number; verdict?: string }) {
  const [id, , , title, difficulty] = row;
  const { band, fill } = difficultyBand(difficulty);
  const solved = verdict === "AC";
  return (
    <a href={problemUrl(row)} target="_blank" rel="noreferrer" className="problem-row" data-band={band}>
      <span className="text-foreground/40">{n}</span>
      <span className="cell-code font-medium text-foreground/50 uppercase">{id}</span>
      <span className="cell-title font-medium text-foreground">
        <span className="diff-dot" style={{ "--fill": `${fill}%` } as CSSProperties} />
        <Title text={title} />
        {/* inline after the title, so it wraps with it rather than needing a column */}
        {verdict && (
          <span
            className={cn(
              "ml-2 inline-flex h-[18px] items-center rounded-md px-1.5 text-[10.5px] leading-none font-semibold tracking-wide whitespace-nowrap",
              solved
                ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                : "bg-foreground/[0.08] text-foreground/60",
            )}
          >
            {verdict}
          </span>
        )}
      </span>
      <span className="cell-diff text-foreground/55">{difficulty}</span>
    </a>
  );
});

/** a few atcoder titles use <s> for strikethrough; everything else is plain text */
function Title({ text }: { text: string }) {
  if (!text.includes("<s>")) return text;
  return text.split(/<s>(.*?)<\/s>/).map((part, i) => (i % 2 ? <s key={i}>{part}</s> : part));
}

function UserForm({ user, loading }: { user: string | null; loading: boolean }) {
  // null mirrors the stored user, so a username restored after hydration shows up
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? user ?? "";

  return (
    <form
      className={cn(CONTROL, "h-10 w-full gap-2 pr-1 pl-3 sm:w-auto")}
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
        className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-foreground/40 sm:w-40 sm:flex-none sm:text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="squircle h-8 cursor-pointer rounded-[10px] bg-accent px-3.5 font-runde text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover disabled:bg-muted disabled:text-foreground/40"
      >
        {loading ? "Syncing" : "Fetch"}
      </button>
    </form>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: [T, string][];
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn(CONTROL, "gap-0.5 px-1")}>
      {options.map(([option, text]) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "squircle relative h-7 cursor-pointer rounded-[9px] px-2.5 transition-colors duration-150 ease-out",
            value === option ? "text-white" : "text-foreground/55 hover:text-foreground",
          )}
        >
          {value === option && (
            <motion.span
              layoutId={`segment-${label}`}
              className="squircle absolute inset-0 rounded-[9px] bg-accent"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{text}</span>
        </button>
      ))}
    </div>
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
    <label className={cn(CONTROL, "relative cursor-pointer pr-8", disabled && "opacity-40")}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "cursor-pointer appearance-none bg-transparent font-medium outline-none disabled:cursor-default",
          FIELD_TEXT,
        )}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 opacity-45"
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
      className={cn(
        "w-14 bg-transparent text-center font-medium tabular-nums outline-none placeholder:text-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        FIELD_TEXT,
      )}
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

// "Ex" was ABC's name for the eighth task, so it sorts where "H" would
const indexKey = (index: string) => (index === "Ex" ? "H" : index);

function compareIndex(a: ProblemRow, b: ProblemRow) {
  return indexKey(a[2]).localeCompare(indexKey(b[2]), "en", { numeric: true });
}

/** deterministic fisher–yates (mulberry32) so rendering stays pure for a given seed */
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
