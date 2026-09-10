"use client";

import Image from "next/image";

import type { PublicEventData } from "@/lib/happily/types";

import { SocialIcon } from "react-social-icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Markdown } from "@/components/markdown";

type SpeakerCardProps = {
  speaker: PublicEventData["speakers"][number];
};

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  const links = [...(speaker.website_url ?? ""), ...speaker.social_urls].filter(
    Boolean,
  );

  return (
    <Dialog>
      <article className="group bg-(--event-base-bg) p-5 text-(--event-base-text) transition-transform duration-500 ease-out hover:-translate-y-1">
        {speaker.image_url ? (
          <Image
            src={speaker.image_url}
            alt=""
            width={400}
            height={400}
            className="mb-4 aspect-square w-full rounded-(--event-border-radius) object-cover grayscale contrast-125 transition-[filter] duration-500 ease-out group-hover:contrast-100"
          />
        ) : null}
        <h3 className="text-xl font-bold">{speaker.name}</h3>
        <p className="mt-1 text-sm text-(--event-base-text)/60">
          {[speaker.title, speaker.company].filter(Boolean).join(", ")}
        </p>
        <div className="flex items-center justify-between gap-3 mt-3 ">
          <div className="flex flex-wrap gap-3 items-center">
            {links.map((url) => (
              <SocialIcon
                key={url}
                url={url}
                style={{ width: 40, height: 40 }}
                className="hover:text-event-secondary-bg-alt"
                bgColor="transparent"
                fgColor={"var(--event-secondary-bg)"}
                target="_blank"
                rel="noreferrer"
              />
            ))}
          </div>
          {speaker.bio && (
            <DialogTrigger className="text-sm font-medium text-(--event-secondary-bg) hover:text-(--event-secondary-bg-alt) transition-colors cursor-pointer">
              More
            </DialogTrigger>
          )}
        </div>
      </article>

      <DialogContent className="max-h-162.5 overflow-y-auto border-none shadow-sm sm:border sm:border-(--event-accent-bg)">
        <DialogDescription className="sr-only">
          Speaker details
        </DialogDescription>
        <div className="space-y-3 text-center sm:space-y-4">
          {speaker.image_url ? (
            <div className="mx-auto max-w-62.5">
              <Image
                src={speaker.image_url}
                alt=""
                width={400}
                height={400}
                className="aspect-square rounded-(--event-border-radius) object-cover grayscale contrast-125"
              />
            </div>
          ) : null}

          <DialogTitle className="text-lg font-semibold sm:text-xl">
            {speaker.name}
          </DialogTitle>

          {speaker.title || speaker.company ? (
            <p className="text-lg sm:text-xl">
              {speaker.title && <span>{speaker.title}</span>}
              {speaker.title && speaker.company && <span>, </span>}
              {speaker.company && <span>{speaker.company}</span>}
            </p>
          ) : null}

          {speaker.website_url ? (
            <p>
              <a
                href={speaker.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm hover:underline sm:text-base"
              >
                {speaker.website_url.replace(/^https?:\/\//, "")}
              </a>
            </p>
          ) : null}

          {speaker.bio ? (
            <Markdown className="text-sm sm:text-base">{speaker.bio}</Markdown>
          ) : null}

          {speaker.social_urls.length > 0 ? (
            <ul className="flex flex-row justify-center">
              {speaker.social_urls.map((url, i) => (
                <li key={url} className={i === 0 ? "-ml-2" : ""}>
                  <SocialIcon
                    style={{ width: 40, height: 40 }}
                    url={url}
                    bgColor="transparent"
                    fgColor={"var(--event-secondary-bg)"}
                    target="_blank"
                    rel="noreferrer"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
