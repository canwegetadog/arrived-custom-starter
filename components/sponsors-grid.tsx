import type { PublicEventData } from "@/lib/happily/types";

import { ordered } from "./helpers";

type SponsorsGridProps = {
  sponsors: PublicEventData["sponsors"];
};

// How many logos make up one full halo revolution along the strip —
// smaller = tighter, more visible curve. Depth is conveyed by scale
// alone (near = bigger) so every logo stays fully white and level;
// only the edge mask below fades anything, right at the page margins.
const CYCLE_LENGTH = 8;
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.05;

function LogoItem({
  sponsor,
  index,
}: {
  sponsor: PublicEventData["sponsors"][number];
  index: number;
}) {
  const angle = ((index % CYCLE_LENGTH) / CYCLE_LENGTH) * Math.PI * 2;
  const depth = (Math.cos(angle) + 1) / 2; // 1 = front/near, 0 = back/far
  const scale = MIN_SCALE + depth * (MAX_SCALE - MIN_SCALE);

  // Masked (not <Image>) so the logo's own silhouette can be recolored
  // on hover — a filter chain like brightness-0/invert can only ever
  // land on black or white, not an arbitrary brand color.
  const content = sponsor.logo_url ? (
    <span
      role="img"
      aria-label={sponsor.name}
      className="block h-10 w-44 shrink-0 bg-paper transition-[transform,background-color] duration-300 ease-out hover:scale-125 hover:bg-loud sm:h-12 sm:w-52"
      style={{
        maskImage: `url(${sponsor.logo_url})`,
        WebkitMaskImage: `url(${sponsor.logo_url})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  ) : (
    <p className="font-heading text-lg font-semibold text-paper transition-[transform,color] duration-300 ease-out hover:scale-125 hover:text-loud">
      {sponsor.name}
    </p>
  );

  return (
    <div
      className="flex h-16 shrink-0 items-center justify-center px-10 transition-transform duration-300"
      style={{ transform: `scale(${scale})` }}
    >
      {sponsor.website ? (
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={sponsor.name}
          className="flex items-center"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export function SponsorsGrid({ sponsors }: SponsorsGridProps) {
  const sorted = ordered(sponsors);

  if (!sorted.length) {
    return null;
  }

  return (
    // Full-bleed to the actual page edges (breaking out of the section's
    // centered max-width column) so the mask below fades logos right at
    // the page margins, not partway through the content column.
    <div
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-8"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 96px, black calc(100% - 96px), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 96px, black calc(100% - 96px), transparent)",
      }}
    >
      {/* Duplicated once so the -50% loop is seamless. */}
      <div className="marquee-track flex w-max items-center">
        {[...sorted, ...sorted].map((sponsor, i) => (
          <LogoItem key={`${sponsor.id}-${i}`} sponsor={sponsor} index={i} />
        ))}
      </div>
    </div>
  );
}
