import Image from "next/image";

import { FadeIn } from "./fade-in";

// Black bookend band, closing out the hero's dark open.
export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t-2 border-loud bg-ink px-2 py-10">
      <FadeIn className="flex flex-col items-center justify-center gap-6">
        <a
          href="https://teamhappily.com/arrived?ref=starter-kit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/powered-by-happily-arrived-dark.svg"
            width={292}
            height={55}
            className="object-contain brightness-0 invert"
            alt="Powered by Happily Arrived"
            draggable={false}
          />
        </a>
      </FadeIn>
    </footer>
  );
}
