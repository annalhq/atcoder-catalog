/** rare-ui's orange-bracketed count: [ 42 ] */
export function BracketCount({ value, className = "" }: { value: number | string; className?: string }) {
  return (
    <span className={`text-muted-foreground tabular-nums ${className}`}>
      <span className="text-accent">[</span>
      {typeof value === "number" ? value.toLocaleString("en-US") : value}
      <span className="text-accent">]</span>
    </span>
  );
}
