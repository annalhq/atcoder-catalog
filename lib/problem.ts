/**
 * Wire format for a problem. Positional tuples keep the RSC payload of large
 * categories (thousands of rows) far smaller than keyed objects with URLs.
 * `contest` is empty when it can be derived from the task id.
 */
export type ProblemRow = [
  id: string,
  contest: string,
  index: string,
  title: string,
  difficulty: number,
  datetime: number,
];

export type ContestFamily = "abc" | "arc" | "agc" | "other";

export function contestOf(id: string) {
  return id.slice(0, id.lastIndexOf("_"));
}

export function contestFamily(id: string): ContestFamily {
  const prefix = id.slice(0, 3);
  return prefix === "abc" || prefix === "arc" || prefix === "agc" ? prefix : "other";
}

export function problemUrl([id, contest]: ProblemRow) {
  return `https://atcoder.jp/contests/${contest || contestOf(id)}/tasks/${id}`;
}
