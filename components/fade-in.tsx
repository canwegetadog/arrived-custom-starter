"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  /** Extra delay, in ms, before the fade starts — for staggering. */
  delay?: number;
  /** Distance, in px, the content rises from as it fades in. */
  y?: number;
};

// Fades content in (with a slight rise) as it scrolls into view, and back
// out as it scrolls past — on every pass, not just the first. Respects
// prefers-reduced-motion by skipping straight to visible and staying there.
export function FadeIn({ children, className, delay = 0, y = 16 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={cn(
        // A high step count reads as fluid motion (each jump is tiny) while
        // still quantizing every property instead of interpolating smoothly
        // — the reveal keeps its digitized, non-analog character without
        // feeling jerky the way a low step count (e.g. steps(6)) does.
        !reducedMotion &&
          "transition-[opacity,transform,filter] duration-700 ease-[steps(24,end)]",
        className,
      )}
      style={
        reducedMotion
          ? undefined
          : {
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : `translateY(${y}px)`,
              filter: visible
                ? "blur(0px) contrast(1) saturate(1)"
                : "blur(14px) contrast(1.6) saturate(0.3)",
              transitionDelay: visible ? `${delay}ms` : "0ms",
            }
      }
    >
      {children}
    </div>
  );
}
