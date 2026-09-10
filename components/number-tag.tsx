import { cn } from "@/lib/utils";

type NumberTagProps = {
  n: number | string;
  className?: string;
};

// Map-legend-style numbered marker, reused for section eyebrows and
// agenda entries so the whole page reads as one numbered system.
export function NumberTag({ n, className }: NumberTagProps) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center border-2 border-current font-display text-xs font-bold tabular-nums",
        className,
      )}
    >
      {typeof n === "number" ? String(n).padStart(2, "0") : n}
    </span>
  );
}
