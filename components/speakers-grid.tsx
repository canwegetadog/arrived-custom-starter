import type { PublicEventData } from "@/lib/happily/types";

import { FadeIn } from "./fade-in";
import { ordered } from "./helpers";
import { SpeakerCard } from "./speaker-card";
import { SpotlightFrames } from "./spotlight-frames";

type SpeakersGridProps = {
  speakers: PublicEventData["speakers"];
};

export function SpeakersGrid({ speakers }: SpeakersGridProps) {
  const sorted = ordered(speakers);
  const withImages = sorted.filter((s) => s.image_url);
  // The frame strip needs several photographed faces to read as a
  // lineup — below that it's not worth the interactive layout.
  const useSpotlight = withImages.length >= 4;

  if (useSpotlight) {
    return (
      <SpotlightFrames
        frames={withImages.map((speaker) => ({
          id: speaker.id,
          src: speaker.image_url!,
          label: speaker.name,
          sublabel: [speaker.title, speaker.company].filter(Boolean).join(", "),
        }))}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((speaker, i) => (
        <FadeIn key={speaker.id} delay={i * 80} y={12}>
          <SpeakerCard speaker={speaker} />
        </FadeIn>
      ))}
    </div>
  );
}
