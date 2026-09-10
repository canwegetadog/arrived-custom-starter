import { cn } from "@/lib/utils";

// Hand-drawn accents — used sparingly, over clean type, to keep the
// system from reading as templated. Stroke color follows currentColor.

export function ScribbleUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 20"
      fill="none"
      aria-hidden="true"
      className={cn("h-3.5 w-full text-loud", className)}
      preserveAspectRatio="none"
    >
      <path
        d="M2 14.5C40 6 90 4 110 9.5C130 15 175 16 218 6"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ScribbleArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 60"
      fill="none"
      aria-hidden="true"
      className={cn("h-10 w-14 text-pop", className)}
    >
      <path
        d="M4 8C28 6 55 14 78 34"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M55 30C64 32 71 34 79 35C78 27 76 20 75 12"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
