// Extracts problem data from the original static site (one HTML page per
// category, each embedding `const PROBLEMS = [...]`) into data/catalog.json.
//
// The output stores every problem once, as a positional tuple, and each
// category as a list of indices into that table — about a tenth of the size of
// the source pages. One entry per line keeps git diffs readable.
//
// Usage: node scripts/extract-problems.mjs [sourceDir]

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const SOURCE = process.argv[2] ?? "sample";
const OUT = "data/catalog.json";
const PROBLEMS_RE = /const PROBLEMS = (\[[\s\S]*?\]);\n/;

const contestOf = (id) => id.slice(0, id.lastIndexOf("_"));

/** @type {Map<string, [string, string, string, string, number, number]>} */
const problems = new Map();
/** @type {Record<string, string[]>} */
const categories = {};
let reruns = 0;

for (const file of readdirSync(SOURCE).sort()) {
  if (!file.endsWith(".html") || file === "index.html") continue;
  const match = PROBLEMS_RE.exec(readFileSync(path.join(SOURCE, file), "utf8"));
  if (!match) continue;

  const ids = new Set();
  for (const p of JSON.parse(match[1])) {
    const row = [
      p.id,
      p.contest_id === contestOf(p.id) ? "" : p.contest_id,
      p.problem_index,
      p.title,
      Math.max(0, p.difficulty ?? 0),
      p.datetime,
    ];
    // Tasks reused in later contests (e.g. AtCoder Daily Training reruns) show
    // up under the rerun's contest, index and date on some pages. The earliest
    // appearance is the original contest.
    const existing = problems.get(p.id);
    if (existing && existing[5] !== row[5]) reruns++;
    if (!existing || row[5] < existing[5]) problems.set(p.id, row);
    ids.add(p.id);
  }
  // Source order is kept: it is meaningful for the practice ladder.
  categories[file.slice(0, -".html".length)] = [...ids];
}

const table = [...problems.values()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
const position = new Map(table.map((row, i) => [row[0], i]));

const json = [
  '{"problems":[',
  table.map((row) => JSON.stringify(row)).join(",\n"),
  '],"categories":{',
  Object.entries(categories)
    .map(([slug, ids]) => `${JSON.stringify(slug)}:${JSON.stringify(ids.map((id) => position.get(id)))}`)
    .join(",\n"),
  "}}",
].join("\n");

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, json + "\n");

const memberships = Object.values(categories).reduce((sum, ids) => sum + ids.length, 0);
console.log(
  `${table.length} problems, ${Object.keys(categories).length} categories, ${memberships} memberships → ${OUT} (${(json.length / 1024).toFixed(0)} KB)`,
);
if (reruns) console.log(`${reruns} rerun listings resolved to their original contest.`);
