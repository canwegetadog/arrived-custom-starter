import type { ReactNode } from "react";

import type { PublicEventData } from "@/lib/happily/types";

import { cn } from "@/lib/utils";

import { Footer } from "./footer";
import { text } from "./helpers";
import type { NavLinkItem } from "./side-nav";
import { SideNav } from "./side-nav";

type EventShellProps = {
  eventData: PublicEventData;
  children: ReactNode;
};

export function EventShell({ eventData, children }: EventShellProps) {
  const { event } = eventData;

  const nav: NavLinkItem[] = [
    { label: "About", href: "/#about" },
    { label: "Agenda", href: "/#agenda" },
    { label: "Speakers", href: "/#speakers" },
    { label: "Sponsors", href: "/#sponsors" },
    { label: "FAQ", href: "/#faqs" },
    ...(event.photos_toggle ? [{ label: "Gallery", href: "/photos" }] : []),
  ];

  const buttonLinks = event.display_settings.buttonLinks;
  const showCta =
    eventData.form?.is_active &&
    buttonLinks?.navCTA.display &&
    buttonLinks.heroCTA.text;

  const hideNavigation = event.display_settings.hideNavigation ?? false;

  return (
    <div className="flex min-h-screen flex-col bg-(--event-base-bg) text-(--event-base-text)">
      {!hideNavigation ? (
        <SideNav
          nav={nav}
          logo={event.logo_url}
          logoAlt={`${event.name} logo`}
          ctaText={
            showCta ? text(buttonLinks!.heroCTA.text, "Register") : undefined
          }
          ctaHref={showCta ? "/#register" : undefined}
        />
      ) : null}
      <div
        className={cn(
          "flex flex-1 flex-col",
          !hideNavigation && "pl-11",
        )}
      >
        {children}
        <Footer />
      </div>
    </div>
  );
}
