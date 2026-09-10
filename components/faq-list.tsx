"use client";

import { useState } from "react";
import { MessageCircleQuestionIcon } from "lucide-react";

import type { PublicEventData } from "@/lib/happily/types";

import { cn } from "@/lib/utils";

import { ordered } from "./helpers";
import { Markdown } from "./markdown";

type FaqListProps = {
  faqs: PublicEventData["faqs"];
};

export function FaqList({ faqs }: FaqListProps) {
  const sorted = ordered(faqs);
  const [activeId, setActiveId] = useState(sorted[0]?.id);
  const active = sorted.find((faq) => faq.id === activeId) ?? sorted[0];

  return (
    <div className="border-2 border-loud">
      <div className="grid bg-paper lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* Question list — click one to see its answer on the right. */}
        <div
          role="tablist"
          aria-label="Frequently asked questions"
          className="flex flex-col gap-1 border-b border-ink/10 p-4 lg:border-r lg:border-b-0 lg:p-6"
        >
          {sorted.map((faq, i) => {
            const isActive = faq.id === active?.id;
            return (
              <button
                key={faq.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(faq.id)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={cn(
                  "stagger-in flex translate-x-0 items-start gap-3 px-3 py-3 text-left text-ink transition-[background-color,transform] duration-500 ease-out",
                  isActive ? "bg-loud" : "hover:translate-x-1 hover:bg-ink/5",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center border text-ink",
                    isActive
                      ? "border-ink/20 bg-paper"
                      : "border-ink/15 bg-paper",
                  )}
                >
                  <MessageCircleQuestionIcon className="size-4" />
                </span>
                <span className="text-sm font-semibold">{faq.question}</span>
              </button>
            );
          })}
        </div>

        {/* Answer panel. */}
        <div className="p-6 sm:p-8">
          {active ? (
            <div className="flex h-full flex-col justify-center border-2 border-loud bg-paper p-6 sm:p-8">
              <p className="font-display text-xs font-semibold tracking-[0.2em] text-loud uppercase">
                {"</answer>"}
              </p>
              <h3 className="font-mono mt-2 text-xl font-bold tracking-tight">
                {active.question}
              </h3>
              <div className="mt-4 text-sm opacity-80">
                <Markdown>{active.answer}</Markdown>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
