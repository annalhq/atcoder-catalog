// AtCoder rating colours: grey, brown, green, cyan, blue, yellow, orange, red,
// then bronze, silver and gold above 3200. The values live in globals.css as
// --color-rating-N so CSS and inline styles share one source.
export const BAND_NAMES = [
  "Grey",
  "Brown",
  "Green",
  "Cyan",
  "Blue",
  "Yellow",
  "Orange",
  "Red",
  "Bronze",
  "Silver",
  "Gold",
] as const;

export const BAND_COUNT = BAND_NAMES.length;

export const bandColor = (band: number) => `var(--color-rating-${band})`;

/** Colour band of a difficulty and how far into its 400-point range it is (%). */
export function difficultyBand(difficulty: number) {
  if (difficulty <= 0) return { band: 0, fill: 0 };
  const band = Math.min(Math.floor(difficulty / 400), BAND_COUNT - 1);
  const fill = band >= 8 ? 100 : Math.round(((difficulty % 400) / 400) * 100);
  return { band, fill };
}
