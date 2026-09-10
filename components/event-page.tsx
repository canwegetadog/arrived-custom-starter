import type { HappilyEnv, PublicEventData } from "@/lib/happily/types";

import { AgendaList } from "./agenda-list";
import { Container } from "./container";
import { ContentSection } from "./content-section";
import { DitherReveal } from "./dither-reveal";
import { FadeIn } from "./fade-in";
import { FaqList } from "./faq-list";
import { hasText, heroImage, text } from "./helpers";
import { HeroSection } from "./hero-section";
import { Markdown } from "./markdown";
import { RegistrationForm } from "./registration-form";
import { ScribbleUnderline } from "./scribble";
import { SectionHeading } from "./section-heading";
import { SpeakersGrid } from "./speakers-grid";
import { SponsorsGrid } from "./sponsors-grid";

type EventPageProps = {
  eventData: PublicEventData;
  eventId: string;
  env: HappilyEnv;
};

// Sections stack as flat, full-bleed color panels with hard edges — no
// rounding, no overlap — like the reference site's blue/black blocks.
const CAP = "relative z-10";

export function EventPage({ eventData, eventId, env }: EventPageProps) {
  const { event, form, sessions, speakers, sponsors, faqs, tracks } = eventData;
  const content = event.content;

  // Real event photos only (no stock imagery) for the one "controlled
  // chaos" section — deduped, capped by ScatteredCollage itself.
  const collageImages = [
    content.companyAboutImage,
    content.aboutImage,
    heroImage(content),
    ...speakers.slice(0, 3).map((s) => s.image_url),
  ].filter((src, i, arr): src is string => Boolean(src) && arr.indexOf(src) === i);

  return (
    <main>
      <HeroSection event={event} formActive={form?.is_active} />

      {hasText(content.aboutTitle) || hasText(content.aboutDescription) ? (
        <ContentSection
          id="about"
          title={text(content.aboutTitle, "About")}
          description={content.aboutDescription}
          image={content.aboutImage}
          index={1}
          wide
          wrapperClassName={`bg-paper ${CAP}`}
        />
      ) : null}

      {sessions.length ? (
        <Container
          id="agenda"
          wrapperClassName={`bg-paper map-grid-texture ${CAP}`}
        >
          <SectionHeading
            title={text(content.agendaTitle, "Agenda")}
            description={content.agendaDescription}
            index={2}
            tag="agenda"
          />
          <FadeIn delay={150} className="mt-8">
            <AgendaList
              sessions={sessions}
              speakers={speakers}
              tracks={tracks}
              event={event}
            />
          </FadeIn>
        </Container>
      ) : null}

      {speakers.length ? (
        <Container id="speakers" wrapperClassName={`bg-ink text-paper ${CAP}`}>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <SectionHeading
              title={text(content.speakersTitle, "Speakers")}
              description={content.speakersDescription}
              index={3}
              align="left"
              tag="speakers"
            />
            <FadeIn delay={150}>
              <SpeakersGrid speakers={speakers} />
            </FadeIn>
          </div>
        </Container>
      ) : null}

      {form ? (
        <section
          id="register"
          className={`relative isolate w-full overflow-hidden bg-paper px-4 py-20 text-ink sm:px-8 sm:py-28 ${CAP}`}
        >
          <DitherReveal
            src="/hero-david.jpg"
            fit="cover"
            yAnchor={0.8}
            zoom={1.6}
            grayscale
            interactive={false}
            waveSpeed={35}
            radius={0.09}
            softness={1}
            ditherColorA="#f3f3f3"
            ditherColorB="#d2d2d2"
            className="absolute inset-0 -z-10 size-full"
          />
          <FadeIn className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
            <p className="mb-3 font-display text-xs tracking-[0.15em] text-loud uppercase">
              {"</register>"}
            </p>
            <div className="w-full overflow-hidden border border-ink/10 bg-paper">
              <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
                {form.form_title ? (
                  <h2 className="font-mono text-4xl font-bold tracking-tight uppercase">
                    {text(form.form_title, "Register")}
                  </h2>
                ) : null}
                <ScribbleUnderline className="mt-2 h-3 w-32 text-loud" />
                {form.form_description ? (
                  <Markdown className="mt-4 max-w-xl text-base opacity-80">
                    {form.form_description}
                  </Markdown>
                ) : null}
                <div className="mt-8 flex w-full items-center justify-center">
                  <RegistrationForm
                    eventId={eventId}
                    env={env}
                    form={form}
                    redirectTo="/confirmation"
                    buttonText={form.form_button_text}
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      ) : null}

      {hasText(content.companyAboutTitle) ||
      hasText(content.companyAboutDescription) ? (
        <ContentSection
          id="host"
          title={text(content.companyAboutTitle, "About the Host")}
          description={content.companyAboutDescription}
          image={content.companyAboutImage}
          collageImages={collageImages}
          index={4}
          wrapperClassName={`bg-paper ${CAP}`}
        />
      ) : null}

      {sponsors.length ? (
        <Container id="sponsors" wrapperClassName={`bg-ink text-paper ${CAP}`}>
          <SectionHeading
            title={text(content.sponsorsTitle, "Sponsors")}
            description={content.sponsorsDescription}
            index={5}
            tag="partners"
          />
          <FadeIn delay={150} className="mt-8">
            <SponsorsGrid sponsors={sponsors} />
          </FadeIn>
        </Container>
      ) : null}

      {faqs.length ? (
        <Container
          id="faqs"
          className="max-w-5xl"
          wrapperClassName={`bg-paper ${CAP}`}
        >
          <SectionHeading
            title={text(content.faqsTitle, "FAQs")}
            description={content.faqsDescription}
            index={6}
            tag="faq"
          />
          <FadeIn delay={150} className="mt-8">
            <FaqList faqs={faqs} />
          </FadeIn>
        </Container>
      ) : null}
    </main>
  );
}
