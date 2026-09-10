import { useSyncExternalStore } from "react";

// A single client-side store shared by every page: submissions are fetched
// once, cached in localStorage, and later refreshes only request what is new.

const API = "https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions";
const PAGE_SIZE = 500; // the API's fixed page size
const PAGE_DELAY_MS = 1000; // AtCoder Problems asks for ≥1s between requests
const STALE_MS = 5 * 60 * 1000;
const USER_KEY = "atc:user";
const cacheKey = (user: string) => `atc:subs:${user.toLowerCase()}`;

export const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;

/** Problem id → "AC", or the latest non-AC verdict. */
export type Verdicts = Record<string, string>;

type Cache = { lastSecond: number; checkedAt: number; verdicts: Verdicts };

type Submission = { problem_id: string; result: string; epoch_second: number };

export type SubmissionState = {
  user: string | null;
  verdicts: Verdicts | null;
  loading: boolean;
  error: string | null;
};

const EMPTY: SubmissionState = { user: null, verdicts: null, loading: false, error: null };

let state = EMPTY;
let initialized = false;
let inflight: AbortController | null = null;
const listeners = new Set<() => void>();

function update(patch: Partial<SubmissionState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    const saved = localStorage.getItem(USER_KEY);
    if (saved) selectUser(saved);
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useSubmissions() {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

/** Switches to `input`, showing cached verdicts immediately. Returns false if the name is invalid. */
export function selectUser(input: string, { force = false } = {}): boolean {
  const user = input.trim();
  if (!USERNAME_RE.test(user)) {
    update({ error: "AtCoder usernames are 3–16 letters, digits or underscores." });
    return false;
  }

  localStorage.setItem(USER_KEY, user);
  const cache = readCache(user);
  update({ user, verdicts: cache?.verdicts ?? null, error: null });

  if (force || !cache || Date.now() - cache.checkedAt > STALE_MS) {
    void sync(user, cache ?? { lastSecond: -1, checkedAt: 0, verdicts: {} });
  }
  return true;
}

export function clearUser() {
  inflight?.abort();
  localStorage.removeItem(USER_KEY);
  update(EMPTY);
}

async function sync(user: string, cache: Cache) {
  inflight?.abort();
  const controller = new AbortController();
  inflight = controller;
  update({ loading: true });

  try {
    let { lastSecond, verdicts } = cache;
    for (;;) {
      const url = `${API}?user=${encodeURIComponent(user)}&from_second=${lastSecond + 1}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`AtCoder Problems responded with ${res.status}.`);
      const batch: Submission[] = await res.json();

      verdicts = { ...verdicts };
      for (const { problem_id, result, epoch_second } of batch) {
        if (result === "AC" || verdicts[problem_id] !== "AC") verdicts[problem_id] = result;
        lastSecond = Math.max(lastSecond, epoch_second);
      }
      writeCache(user, { lastSecond, checkedAt: Date.now(), verdicts });
      update({ verdicts });

      if (batch.length < PAGE_SIZE) break;
      await sleep(PAGE_DELAY_MS, controller.signal);
    }
  } catch (err) {
    if (!controller.signal.aborted) {
      update({ error: err instanceof Error ? err.message : "Could not load submissions." });
    }
  } finally {
    if (inflight === controller) {
      inflight = null;
      update({ loading: false });
    }
  }
}

function readCache(user: string): Cache | null {
  try {
    const raw = localStorage.getItem(cacheKey(user));
    return raw ? (JSON.parse(raw) as Cache) : null;
  } catch {
    return null;
  }
}

function writeCache(user: string, cache: Cache) {
  try {
    localStorage.setItem(cacheKey(user), JSON.stringify(cache));
  } catch {
    // Storage full or disabled: the in-memory state still works for this visit.
  }
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
