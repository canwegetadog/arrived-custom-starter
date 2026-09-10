"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Frame = {
  id: string;
  src: string;
  label: string;
  sublabel?: string | null;
};

type SpotlightFramesProps = {
  frames: Frame[];
  className?: string;
};

const CLOSED_WIDTH = 56;
const OPEN_WIDTH = 380;
const NATURAL_HEIGHT = 380;
const GUIDE_SPACE = 20;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export function SpotlightFrames({ frames, className }: SpotlightFramesProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [frameWidth, setFrameWidth] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(
    Math.min(1, frames.length - 1),
  );
  const [pointerFine, setPointerFine] = useState(false);

  // Nothing renders until the frame has actually been measured — avoids
  // a flash of the un-scaled, possibly-overflowing natural width.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setFrameWidth(width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setPointerFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const naturalWidth = CLOSED_WIDTH * (frames.length - 1) + OPEN_WIDTH;
  const scale = frameWidth ? Math.min(1, frameWidth / naturalWidth) : null;

  // Position (in natural, unscaled px) of each slat's left edge and the
  // active slat's box — used for the selector box and guide lines.
  const leftOf = (index: number) =>
    index <= activeIndex
      ? index * CLOSED_WIDTH
      : (index - 1) * CLOSED_WIDTH + OPEN_WIDTH;
  const activeLeft = leftOf(activeIndex);

  function move(delta: number) {
    const next =
      (activeIndex + delta + frames.length) % frames.length;
    setActiveIndex(next);
    buttonRefs.current[next]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={frameRef}
        className="relative mx-auto"
        style={{
          maxWidth: naturalWidth,
          height: scale ? NATURAL_HEIGHT * scale + GUIDE_SPACE * 2 : NATURAL_HEIGHT,
        }}
      >
        {scale ? (
          <>
            {/* Top / bottom guide lines — track the active slat's centre. */}
            {(["top", "bottom"] as const).map((side) => (
              <span
                key={side}
                aria-hidden="true"
                className="absolute w-px bg-paper transition-[left] duration-500"
                style={{
                  left: (activeLeft + OPEN_WIDTH / 2) * scale,
                  height: GUIDE_SPACE - 4,
                  top: side === "top" ? 0 : undefined,
                  bottom: side === "bottom" ? 0 : undefined,
                  transitionTimingFunction: EASE,
                }}
              />
            ))}

            <div
              role="tablist"
              aria-label="Speakers"
              onKeyDown={handleKeyDown}
              className="absolute left-1/2 flex overflow-hidden"
              style={{
                top: GUIDE_SPACE,
                width: naturalWidth,
                height: NATURAL_HEIGHT,
                transform: `translateX(-50%) scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              {frames.map((frame, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={frame.id}
                    ref={(el) => {
                      buttonRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={frame.label}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveIndex(i)}
                    onMouseEnter={() => pointerFine && setActiveIndex(i)}
                    className="relative h-full shrink-0 overflow-hidden outline-none transition-[width] duration-500"
                    style={{
                      width: isActive ? OPEN_WIDTH : CLOSED_WIDTH,
                      transitionTimingFunction: EASE,
                    }}
                  >
                    <Image
                      src={frame.src}
                      alt=""
                      width={OPEN_WIDTH}
                      height={NATURAL_HEIGHT}
                      className={cn(
                        "absolute top-0 left-1/2 h-full -translate-x-1/2 object-cover grayscale transition-[filter] duration-[600ms] ease-out",
                        !isActive && "brightness-[0.55]",
                      )}
                    />
                  </button>
                );
              })}

              {/* Selector box — shares the row's transform, so it scales
                  and tracks the active slat with the same easing. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 border border-paper"
                style={{
                  left: activeLeft,
                  width: OPEN_WIDTH,
                  height: NATURAL_HEIGHT,
                  transitionProperty: "left, width",
                  transitionDuration: "500ms",
                  transitionTimingFunction: EASE,
                }}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-6 text-center">
        <p className="font-heading font-semibold text-2xl">{frames[activeIndex]?.label}</p>
        {frames[activeIndex]?.sublabel ? (
          <p className="mt-1 text-sm opacity-70">
            {frames[activeIndex].sublabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
