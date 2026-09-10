"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { ScrollLink } from "./scroll-link";

export type NavLinkItem = {
  label: string;
  href: string;
};

type SideNavProps = {
  nav: NavLinkItem[];
  logo?: string | null;
  logoAlt?: string;
  ctaText?: string;
  ctaHref?: string;
};

// Full-height strip fixed to the left edge — the site's entire chrome
// now lives here instead of a separate top header: logo at the top,
// the section links centered in the remaining space, the register CTA
// pinned to the bottom. Each link is rendered bottom-to-top (writing-mode
// plus a 180° flip per item, not the whole stack, so DOM order still
// reads top-to-bottom down the strip).
export function SideNav({ nav, logo, logoAlt = "Logo", ctaText, ctaHref }: SideNavProps) {
  const [activeHash, setActiveHash] = useState<string | null>(null);

  useEffect(() => {
    const sections = nav
      .map((link) => {
        const hash = link.href.split("#")[1];
        return hash ? document.getElementById(hash) : null;
      })
      .filter((el): el is HTMLElement => el != null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveHash(`#${topMost.target.id}`);
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [nav]);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed inset-y-0 left-0 z-50 flex w-11 flex-col border-r-2 border-paper bg-ink"
    >
      {logo ? (
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center border-b-2 border-paper py-3"
        >
          <Image
            src={logo}
            alt={logoAlt}
            width={28}
            height={28}
            className="max-h-7 w-auto object-contain"
            draggable={false}
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col overflow-y-auto">
        {nav.map((link) => {
          const hash = link.href.includes("#")
            ? `#${link.href.split("#")[1]}`
            : null;
          const isActive = hash != null && hash === activeHash;

          return (
            <ScrollLink
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 items-center justify-center border-b-2 border-paper pt-3 pb-3 text-center font-display text-xs font-bold tracking-[0.2em] uppercase transition-colors hover:bg-paper hover:text-ink",
                isActive ? "bg-paper text-ink" : "text-paper",
              )}
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {link.label}
            </ScrollLink>
          );
        })}
      </div>

      {ctaHref && ctaText ? (
        <ScrollLink
          href={ctaHref}
          className="flex shrink-0 items-center justify-center border-t-2 border-paper bg-loud pt-10 pb-10 text-center font-display text-xs font-bold tracking-[0.25em] text-ink uppercase transition-colors hover:bg-paper"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {ctaText}
        </ScrollLink>
      ) : null}
    </nav>
  );
}
