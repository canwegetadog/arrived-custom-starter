"use client";

import { useEffect, useRef } from "react";

// Replaces the OS cursor (fine-pointer devices only — touch is left
// alone) with a round outlined ring that tracks the pointer exactly,
// plus a coral streak (the site's own accent color) that trails behind
// it. The streak is a handful of pre-rendered <line> segments whose
// endpoints, width, and opacity are driven from a short rolling buffer
// of recent pointer positions — on every animation frame that buffer is
// pruned by age, so the streak naturally shrinks to nothing a moment
// after the pointer stops moving, with no separate "fade out" step.
const TRAIL_SEGMENTS = 32;
const TRAIL_MS = 500;
const TRAIL_COLOR = "var(--loud)"; // the site's coral/orange accent

type Point = { x: number; y: number; t: number };

export function CustomCursor() {
  const markerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const pointsRef = useRef<Point[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!finePointer) return;

    const marker = markerRef.current;
    if (!marker) return;

    document.documentElement.classList.add("custom-cursor-active");

    function onMove(e: PointerEvent) {
      pointsRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      // Defensive cap so a very high sampling rate can't grow this
      // unbounded — age-based pruning below does the real trimming.
      if (pointsRef.current.length > 80) {
        pointsRef.current.splice(0, pointsRef.current.length - 80);
      }
      marker!.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      marker!.style.opacity = "1";
    }

    function onLeaveDocument() {
      marker!.style.opacity = "0";
      pointsRef.current = [];
    }

    function tick() {
      const now = performance.now();
      pointsRef.current = pointsRef.current.filter(
        (p) => now - p.t < TRAIL_MS,
      );

      const points = pointsRef.current;
      const segmentCount = Math.max(0, points.length - 1);

      for (let i = 0; i < TRAIL_SEGMENTS; i++) {
        const line = lineRefs.current[i];
        if (!line) continue;

        if (i >= segmentCount) {
          line.style.opacity = "0";
          continue;
        }

        // Newest segments are at the end of the points array — walk
        // backwards so index 0 is always the freshest (thickest, most
        // opaque) segment, tapering off toward the tail.
        const end = points[points.length - 1 - i];
        const start = points[points.length - 2 - i];
        const age = now - end.t;
        const life = 1 - age / TRAIL_MS; // 1 = brand new, 0 = expiring

        line.setAttribute("x1", String(start.x));
        line.setAttribute("y1", String(start.y));
        line.setAttribute("x2", String(end.x));
        line.setAttribute("y2", String(end.y));
        line.style.opacity = String(Math.max(0, life) * 0.6);
        line.setAttribute(
          "stroke-width",
          String(1 + life * 7 * (1 - i / TRAIL_SEGMENTS)),
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeaveDocument);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        onLeaveDocument,
      );
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Coral streak — a fixed pool of line segments, positioned and
          faded imperatively from the point buffer above. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] size-full"
      >
        {Array.from({ length: TRAIL_SEGMENTS }, (_, i) => (
          <line
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            stroke={TRAIL_COLOR}
            strokeLinecap="round"
            opacity={0}
          />
        ))}
      </svg>

      {/* Ring — tracks the real pointer with no lag, centered exactly on
          the cursor position. */}
      <div
        ref={markerRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-0 transition-opacity duration-150"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <svg viewBox="0 0 28 28" className="-mt-3.5 -ml-3.5 size-7">
          <circle
            cx="14"
            cy="14"
            r="10"
            fill="none"
            stroke="var(--loud)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </>
  );
}
