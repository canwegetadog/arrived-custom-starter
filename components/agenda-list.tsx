"use client";

import { useMemo } from "react";

import type { PublicEventData } from "@/lib/happily/types";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { eventTimeRange, formatEventDate } from "./helpers";
import { Markdown } from "./markdown";
import { NumberTag } from "./number-tag";

type AgendaListProps = {
  sessions: PublicEventData["sessions"];
  speakers: PublicEventData["speakers"];
  tracks: PublicEventData["tracks"];
  event: PublicEventData["event"];
};

type Speaker = PublicEventData["speakers"][number];
type Session = PublicEventData["sessions"][number];
type Track = PublicEventData["tracks"][number];

function groupByDay(sessions: Session[], timezone: string | null) {
  const groups: [string, Session[]][] = [];
  const map = new Map<string, Session[]>();

  for (const session of sessions) {
    const key = session.start_time
      ? (formatEventDate(session.start_time, timezone, {
          weekday: "long",
          month: "long",
          day: "numeric",
        }) ?? "TBD")
      : "TBD";

    let group = map.get(key);
    if (!group) {
      group = [];
      map.set(key, group);
      groups.push([key, group]);
    }
    group.push(session);
  }

  return groups;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function SpeakersList({ speakers }: { speakers: Speaker[] }) {
  return (
    <div className="md:col-span-7 md:col-start-4">
      <div className="grid gap-4 pt-6 md:grid-cols-2">
        {speakers.map((speaker) => (
          <div key={speaker.id} className="flex items-center gap-4 text-xs">
            <Avatar className="size-14 shrink-0 rounded-(--event-border-radius) after:rounded-(--event-border-radius)">
              {speaker.image_url && (
                <AvatarImage
                  src={speaker.image_url}
                  alt={speaker.name}
                  className="rounded-(--event-border-radius) grayscale contrast-125"
                />
              )}
              <AvatarFallback className="rounded-(--event-border-radius)">
                {initials(speaker.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{speaker.name}</p>
              <p>
                {speaker.title && <span>{speaker.title}</span>}
                {speaker.title && speaker.company && <span>, </span>}
                {speaker.company && <span>{speaker.company}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionAccordion({
  sessions,
  speakerMap,
  trackMap,
  event,
}: {
  sessions: Session[];
  speakerMap: Map<string, Speaker>;
  trackMap: Map<number, Track>;
  event: PublicEventData["event"];
}) {
  return (
    <Accordion type="single" collapsible className="font-body grid grid-cols-1">
      {sessions.map((session, i) => {
        const timeLabel = eventTimeRange({
          ...event,
          start_date: session.start_time,
          end_date: session.end_time,
        });

        const track =
          session.track_id != null
            ? (trackMap.get(session.track_id) ?? null)
            : null;

        const sessionSpeakers = session.speakers
          .map((ss) => speakerMap.get(ss.speaker_id))
          .filter((s): s is Speaker => s != null);

        const hasContent =
          session.description ||
          sessionSpeakers.length > 0 ||
          track ||
          session.location;

        return (
          <AccordionItem value={session.id} key={session.id}>
            <AccordionTrigger
              disabled={!hasContent}
              className="w-full translate-x-0 no-underline transition-[background-color,transform] duration-500 ease-out hover:translate-x-1 hover:bg-loud/5 hover:no-underline md:grid md:grid-cols-10 md:gap-x-10 lg:gap-x-20"
            >
              <div className="hidden items-start gap-3 md:col-span-3 md:flex">
                <NumberTag n={i + 1} className="border-loud text-loud" />
                <p className="font-heading font-semibold pt-0.5 text-lg lg:text-xl">
                  {timeLabel}
                </p>
              </div>
              <div className="flex w-full flex-col items-start text-left md:col-span-6">
                <div className="flex items-center gap-2 md:hidden">
                  <NumberTag n={i + 1} className="border-loud text-loud" />
                  <p className="font-heading font-semibold text-sm">{timeLabel}</p>
                </div>
                <p className="mt-2 text-base font-semibold tracking-wider md:mt-0 md:text-lg lg:text-xl">
                  {session.name}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="md:grid md:grid-cols-10 md:gap-x-10 md:pb-6 lg:gap-x-20">
              <div className="col-span-3 flex flex-wrap gap-2">
                {track && (
                  <Badge
                    variant="secondary"
                    className="cursor-auto rounded-sm bg-loud px-6 py-[10px] text-sm font-bold text-ink"
                  >
                    {track.name}
                  </Badge>
                )}
                {session.location && (
                  <Badge
                    variant="secondary"
                    className="cursor-auto rounded-sm bg-loud px-6 py-[10px] text-sm font-bold text-ink"
                  >
                    {session.location}
                  </Badge>
                )}
              </div>

              {session.description && (
                <div className="col-span-7 col-start-4 pt-3 text-sm leading-relaxed tracking-wide">
                  <Markdown>{session.description}</Markdown>
                </div>
              )}
              {sessionSpeakers.length > 0 && (
                <SpeakersList speakers={sessionSpeakers} />
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function AgendaList({
  sessions,
  speakers,
  tracks,
  event,
}: AgendaListProps) {
  const sorted = useMemo(
    () =>
      [...sessions].sort((a, b) =>
        String(a.start_time ?? "").localeCompare(String(b.start_time ?? "")),
      ),
    [sessions],
  );

  const speakerMap = useMemo(
    () => new Map(speakers.map((s) => [s.id, s])),
    [speakers],
  );
  const trackMap = useMemo(
    () => new Map(tracks.map((t) => [t.id, t])),
    [tracks],
  );

  const days = useMemo(
    () => groupByDay(sorted, event.timezone),
    [sorted, event.timezone],
  );

  if (days.length <= 1) {
    return (
      <div className="pt-5">
        <SessionAccordion
          sessions={sorted}
          speakerMap={speakerMap}
          trackMap={trackMap}
          event={event}
        />
      </div>
    );
  }

  return (
    <div className="pt-5">
      <Tabs defaultValue={days[0][0]}>
        <TabsList
          variant="line"
          className="size-full justify-start overflow-x-auto"
        >
          {days.map(([dayLabel]) => (
            <TabsTrigger
              key={dayLabel}
              value={dayLabel}
              className="w-full py-1.5 lg:py-1 lg:text-lg"
            >
              {dayLabel}
            </TabsTrigger>
          ))}
        </TabsList>
        {days.map(([dayLabel, daySessions]) => (
          <TabsContent key={dayLabel} value={dayLabel}>
            <SessionAccordion
              sessions={daySessions}
              speakerMap={speakerMap}
              trackMap={trackMap}
              event={event}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
