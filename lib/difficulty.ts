// atcoder rating colours: grey, brown, green, cyan, blue, yellow, orange, red,
// then bronze, silver and gold above 3200. values live in globals.css as
// --rating-N with light and dark variants
const BAND_COUNT = 11;

export const bandColor = (band: number) => `var(--rating-${band})`;

/** colour band of a difficulty and how far into its 400-point range it is (%) */
export function difficultyBand(difficulty: number) {
  if (difficulty <= 0) return { band: 0, fill: 0 };
  const band = Math.min(Math.floor(difficulty / 400), BAND_COUNT - 1);
  const fill = band >= 8 ? 100 : Math.round(((difficulty % 400) / 400) * 100);
  return { band, fill };
}
