import type { PublicEventData } from "@/lib/happily/types";

import { Button } from "@/components/ui/button";

import { Container } from "./container";
import { DitherReveal } from "./dither-reveal";
import { EventDetails } from "./event-details";
import { FadeIn } from "./fade-in";
import Globe from "./globe";
import { eventDateRange, text } from "./helpers";
import { ScrollLink } from "./scroll-link";
import { WaveLines } from "./wave-lines";

type HeroSectionProps = {
  event: PublicEventData["event"];
  formActive?: boolean;
};

export function HeroSection({ event, formActive }: HeroSectionProps) {
  const content = event.content;

  const showCta =
    formActive &&
    event.display_settings.buttonLinks?.heroCTA.display &&
    event.display_settings.buttonLinks.heroCTA.text;

  const dateRange = eventDateRange(event);

  return (
    <section
      id="hero"
      className="relative isolate min-h-[500px] overflow-hidden bg-ink text-paper"
    >
      <WaveLines className="absolute inset-0 -z-30 size-full text-paper opacity-15" />

      {/* Same dither-reveal treatment as the register section's photo
          backdrop, just dark instead of light — fills the negative
          space around the globe instead of a flat ink fill. */}
      <DitherReveal
        src="/hero-david.jpg"
        fit="cover"
        yAnchor={0.65}
        zoom={1.9}
        grayscale
        interactive={false}
        waveSpeed={35}
        radius={0.09}
        softness={1}
        ditherColorA="#403f3f"
        ditherColorB="#0e0e0e"
        className="absolute inset-0 -z-[25] size-full"
      />

      {/* Drag-to-spin globe, land dots in the brand's coral against a
          near-black sphere — replaces the old dither photo as the
          hero's animated backdrop. pointer-events-auto punches through
          the pointer-events-none Container below so it's still
          draggable even though the text sits "on top" in DOM order. */}
      <div className="pointer-events-auto absolute inset-0 -z-20 size-full">
        <Globe
          speed={2}
          smoothing={8}
          dots={{ color: "#f95128", size: 4, density: 7, allDots: false }}
          fill="dots"
          scale={9}
          stopOnHover
          direction="left"
          initialLatitude={15}
          initialLongitude={20}
          oceanColor="#0e0e0e"
          outlineColor="rgba(243, 243, 243, 0.25)"
          showOutline
          graticuleColor="rgba(243, 243, 243, 0.08)"
          showGrid
          outlineWidth={1}
          dragSpeed={5}
          detail={5}
        />
      </div>

      {/* Dark scrim just behind the (now white) text so the headline
          stays legible without washing out the globe underneath. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--ink)_0%,_transparent_42%)] opacity-55"
      />

      {/* pointer-events-none lets the dither shader receive the cursor
          under the empty space of this full-height layout; only the
          actual interactive control opts back in. */}
      <Container
        wrapperClassName="pointer-events-none"
        className="pointer-events-none relative grid min-h-[500px] content-center max-w-7xl gap-8 py-14 text-center"
      >
        <FadeIn className="mx-auto flex flex-col items-center">
          {dateRange ? (
            <p className="mb-4 font-display text-xs tracking-[0.15em] text-loud sm:text-sm">
              {"</"}
              {dateRange}
              {">"}
            </p>
          ) : null}

          <div className="inline-block divide-y-2 divide-paper border-2 border-paper bg-ink/50 backdrop-blur-sm">
            <div className="px-6 py-3 sm:px-12 sm:py-5">
              <span className="font-display block text-3xl font-bold tracking-tight uppercase sm:text-5xl">
                {text(content.companyName, "Independent event")}
              </span>
            </div>
            <div className="px-6 py-3 sm:px-12 sm:py-5">
              <span className="font-display block text-3xl font-bold tracking-tight text-loud uppercase sm:text-5xl">
                {text(event.name, event.name)}
              </span>
            </div>
          </div>

          <p className="mt-6 font-display text-xs tracking-[0.15em] uppercase opacity-70">
            {text(event.type, "Join us")}
          </p>
          <EventDetails event={event} />
          {content.heroText ? (
            <p className="mx-auto mt-2 max-w-md text-sm opacity-70 sm:text-base">
              {text(content.heroText)}
            </p>
          ) : null}
          {showCta ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="pointer-events-auto mt-6 rounded-none border-2 border-paper bg-transparent px-8 font-display tracking-[0.15em] text-paper uppercase shadow-none hover:bg-paper hover:text-ink"
            >
              <ScrollLink href="#register">
                {text(
                  event.display_settings.buttonLinks!.heroCTA.text,
                  "Register",
                )}
              </ScrollLink>
            </Button>
          ) : null}
        </FadeIn>
      </Container>
    </section>
  );
}
