import { BAND_NAMES, bandColor } from "@/lib/difficulty";

/** Stacked bar of how a category's problems spread across AtCoder colour bands. */
export function DifficultyBar({ bands, className = "" }: { bands: number[]; className?: string }) {
  const total = bands.reduce((sum, n) => sum + n, 0);
  const label = bands
    .flatMap((n, band) => (n > 0 ? [`${n} ${BAND_NAMES[band].toLowerCase()}`] : []))
    .join(", ");

  return (
    <span
      role="img"
      aria-label={`Difficulty spread: ${label}`}
      title={label}
      className={`h-1.5 overflow-hidden rounded-full bg-elevated ${className}`}
    >
      {bands.map((n, band) =>
        n > 0 ? (
          <span key={band} className="h-full" style={{ width: `${(n / total) * 100}%`, background: bandColor(band) }} />
        ) : null,
      )}
    </span>
  );
}
