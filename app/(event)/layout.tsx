import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "../globals.css";

import { CustomCursor } from "@/components/custom-cursor";
import { EventShell } from "@/components/event-shell";
import { PreviewBanner } from "@/components/preview-banner";
import { isPreviewRequest, resolveEventEnv } from "@/lib/happily/config";
import { getPublicEvent } from "@/lib/happily/queries";

// First-party analytics proxy host.
const ANALYTICS_HOST = "https://hx.happily.events";

const spaceMono = Space_Mono({
  variable: "--font-display",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { event } = await getPublicEvent();
  const { metadata } = event;

  return {
    title: metadata.title || event.name,
    description: metadata.description || "",
    ...(metadata.allow_search_engine_indexing === false && {
      robots: "noindex, nofollow",
    }),
    openGraph: {
      ...(metadata.image_url && { images: [metadata.image_url] }),
    },
  };
}

export default async function EventLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const preview = await isPreviewRequest();
  const env = await resolveEventEnv();
  const eventData = await getPublicEvent({ env });

  // Only track published-site visits: no analytics in preview or when
  // the event has no analytics configured.
  const analyticsId = env === "prod" ? eventData.event.analytics_id : null;

  // Fixed brand palette for this redesign: --event-* vars normally come
  // from the CMS's per-event styles, but this kit intentionally overrides
  // them with a single hardcoded system (see components/event-page.tsx)
  // rather than the event's configured theme.
  const eventVars = {
    "--event-primary-bg": "var(--loud)",
    "--event-primary-text": "var(--ink)",
    "--event-secondary-bg": "var(--pop)",
    "--event-secondary-text": "var(--ink)",
    "--event-accent-bg": "var(--loud)",
    "--event-accent-text": "var(--ink)",
    "--event-base-bg": "var(--paper)",
    "--event-base-text": "var(--ink)",
    "--event-border-radius": "0px",
  } as CSSProperties;

  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${spaceMono.className} h-full antialiased`}
    >
      <body style={eventVars} className="min-h-full flex flex-col">
        <CustomCursor />
        {preview && <PreviewBanner />}
        {analyticsId && (
          <script
            defer
            src={`${ANALYTICS_HOST}/script.js`}
            data-host-url={ANALYTICS_HOST}
            data-website-id={analyticsId}
          />
        )}
        <EventShell eventData={eventData}>{children}</EventShell>
      </body>
    </html>
  );
}
