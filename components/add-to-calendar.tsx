"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  type CalendarEvent,
  downloadIcsFile,
  generateGoogleCalendarUrl,
  generateICSContent,
  generateOffice365CalendarUrl,
  generateOutlookCalendarUrl,
  generateYahooCalendarUrl,
} from "@/lib/happily/calendar";

type AddToCalendarProps = {
  event: CalendarEvent;
  className?: string;
};

const services = [
  {
    name: "Apple",
    icon: "/email-icons/apple.png",
    generate: generateICSContent,
    open: downloadIcsFile,
  },
  {
    name: "Google",
    icon: "/email-icons/google.png",
    generate: generateGoogleCalendarUrl,
    open: (url: string) => window.open(url, "_blank"),
  },
  {
    name: "Office 365",
    icon: "/email-icons/office365.png",
    generate: generateOffice365CalendarUrl,
    open: (url: string) => window.open(url, "_blank"),
  },
  {
    name: "Outlook.com",
    icon: "/email-icons/outlook.png",
    generate: generateOutlookCalendarUrl,
    open: (url: string) => window.open(url, "_blank"),
  },
  {
    name: "Yahoo",
    icon: "/email-icons/yahoo.png",
    generate: generateYahooCalendarUrl,
    open: (url: string) => window.open(url, "_blank"),
  },
] as const;

export function AddToCalendar({ event, className }: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-h-12 rounded-none bg-(--event-primary-bg) text-base font-bold text-(--event-primary-text) hover:bg-(--event-primary-bg)/85 px-5 py-3 transition"
      >
        Add to Calendar
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-56 border border-(--event-base-text)/10 rounded-sm bg-white py-1 shadow-lg">
          {services.map((service) => (
            <button
              key={service.name}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-black transition hover:bg-black/5"
              onClick={() => {
                const data = service.generate(event);
                service.open(data);
                setOpen(false);
              }}
            >
              <Image
                src={service.icon}
                alt=""
                width={24}
                height={24}
                className="size-6 object-contain"
              />
              {service.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
