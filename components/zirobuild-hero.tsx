"use client";

import { ArrowRight } from "lucide-react";

type AnimatedTextProps = {
  text: string;
};

// Vertical "ticker roll": two identical copies stacked in the same box —
// the top one rolls up and out on hover while an identical copy rolls up
// into its place from below. Depends on the parent element carrying the
// `group` class.
function AnimatedText({ text }: AnimatedTextProps) {
  return (
    <span className="relative overflow-hidden inline-flex">
      <span className="transition-transform duration-500 ease-in-out group-hover:-translate-y-[120%] whitespace-nowrap">
        {text}
      </span>
      <span className="absolute inset-0 transition-transform duration-500 ease-in-out translate-y-[120%] group-hover:translate-y-0 whitespace-nowrap flex justify-center items-center">
        {text}
      </span>
    </span>
  );
}

type ZiroBuildHeroProps = {
  className?: string;
};

export function ZiroBuildHero({ className }: ZiroBuildHeroProps) {
  return (
    <div
      className={`relative min-h-screen w-full flex flex-col overflow-hidden text-white font-sans bg-black ${className ?? ""}`}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://cdn.jiro.build/BG%20effect%20for%20Tanvir/bg-video.mp4"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-8 py-6 w-full max-w-[900px] mx-auto">
          <div className="text-2xl font-semibold tracking-tight">
            ZiroBuild
          </div>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            {["Home", "Products", "Pricing", "Features", "Resources"].map(
              (label) => (
                <a
                  key={label}
                  href="#"
                  className="group hover:text-white transition-colors"
                >
                  <AnimatedText text={label} />
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-6 text-sm font-medium">
            <a
              href="#"
              className="group hover:text-white text-gray-300 transition-colors"
            >
              <AnimatedText text="Log in" />
            </a>
            <button className="group px-5 py-2.5 border border-white/20 rounded-md hover:bg-white/10 transition-colors">
              <AnimatedText text="Get Started" />
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center pr-4 pl-[17px] max-w-5xl mx-auto text-center w-full mt-12 mb-[-80px] h-[680px]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-medium text-gray-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Trusted by 500+ Innovation Teams
          </div>

          <h1 className="text-[80px] leading-[88.6px] font-display font-medium tracking-tight mb-[20px]">
            Build The Future With
            <br />
            AI-Native Products
          </h1>

          <p className="text-[18px] leading-[26px] text-gray-300 mb-8 max-w-2xl font-light">
            Design, build, and scale intelligent products, with powerful AI
            tools built for modern teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="group px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              <AnimatedText text="Explore More" />
            </button>
            <button className="group px-8 py-4 bg-white/10 border border-white/30 backdrop-blur-md text-white font-medium rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
              <AnimatedText text="Get Started" />
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
