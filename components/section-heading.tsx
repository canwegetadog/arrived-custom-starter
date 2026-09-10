import { cn } from "@/lib/utils";

import { FadeIn } from "./fade-in";
import { Markdown } from "./markdown";
import { NumberTag } from "./number-tag";

type SectionHeadingProps = {
  title: string;
  description?: string | null;
  index?: number;
  align?: "left" | "center";
  /** Widen the description text box beyond the default max-w-2xl. */
  wide?: boolean;
  /** Terminal-style eyebrow rendered as {"</" + tag + ">"}. */
  tag?: string;
};

export function SectionHeading({
  title,
  description,
  index,
  align = "center",
  wide = false,
  tag,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <FadeIn className={centered ? "text-center" : "text-left"}>
      {tag ? (
        <p className="mb-3 font-display text-xs tracking-[0.15em] text-loud uppercase">
          {"</"}
          {tag}
          {">"}
        </p>
      ) : null}
      {index != null ? (
        <div
          className={cn(
            "mb-4 flex items-center gap-3",
            centered && "justify-center",
          )}
        >
          <NumberTag n={index} />
          <span
            className={cn(
              "h-px max-w-16 bg-current opacity-30",
              centered ? "w-16" : "flex-1",
            )}
          />
        </div>
      ) : null}
      <h2 className="font-heading font-bold text-4xl leading-[0.95] tracking-tight uppercase sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <div
          className={cn(
            "mt-4 text-base opacity-80 md:text-lg",
            wide ? "max-w-4xl" : "max-w-2xl",
            centered && "mx-auto",
          )}
        >
          <Markdown>{description}</Markdown>
        </div>
      ) : null}
    </FadeIn>
  );
}
