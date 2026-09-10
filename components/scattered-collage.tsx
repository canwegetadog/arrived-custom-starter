import Image from "next/image";

import { cn } from "@/lib/utils";

type ScatteredCollageProps = {
  images: string[];
};

// The one deliberately busy section: a contained, textured pile of the
// event's own photos (not stock art). Kept inside a padded, bordered
// panel so the chaos reads as intentional rather than spilling into the
// calm sections around it.
const PLACEMENTS = [
  "rotate-[-6deg] translate-y-2",
  "rotate-[4deg] -translate-y-3 sm:translate-x-2",
  "rotate-[-3deg] translate-y-5 sm:-translate-x-1",
  "rotate-[7deg] -translate-y-1",
  "rotate-[-8deg] translate-y-1 sm:translate-x-3",
];

const TAPE_SIDES = ["bg-pop", "bg-loud", "bg-paper"];

export function ScatteredCollage({ images }: ScatteredCollageProps) {
  const items = images.slice(0, 5);

  return (
    <div className="halftone-texture rounded-none border border-ink/10 p-8 sm:p-12">
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
        {items.map((src, i) => (
          <div
            key={src}
            className={cn(
              "relative w-40 shrink-0 bg-paper p-2 pb-5 shadow-[6px_6px_0_0_rgba(14,14,14,0.15)] sm:w-48",
              PLACEMENTS[i % PLACEMENTS.length],
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute -top-2.5 left-1/2 h-5 w-12 -translate-x-1/2 -rotate-2 opacity-80",
                TAPE_SIDES[i % TAPE_SIDES.length],
              )}
            />
            <Image
              src={src}
              alt=""
              width={300}
              height={300}
              className="aspect-square w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
