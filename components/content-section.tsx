import Image from "next/image";

import { Container } from "./container";
import { FadeIn } from "./fade-in";
import { ScatteredCollage } from "./scattered-collage";
import { SectionHeading } from "./section-heading";

type ContentSectionProps = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  index?: number;
  collageImages?: string[];
  wrapperClassName?: string;
  wide?: boolean;
};

export function ContentSection({
  id,
  title,
  description,
  image,
  index,
  collageImages,
  wrapperClassName,
  wide,
}: ContentSectionProps) {
  const hasCollage = (collageImages?.length ?? 0) > 0;

  if (hasCollage) {
    return (
      <Container id={id} className="grid max-w-5xl gap-10" wrapperClassName={wrapperClassName}>
        <SectionHeading
          title={title}
          description={description}
          index={index}
          wide={wide}
          tag={id}
        />
        <FadeIn delay={150}>
          <ScatteredCollage images={collageImages!} />
        </FadeIn>
      </Container>
    );
  }

  return (
    <Container
      id={id}
      className={`grid max-w-7xl gap-8 ${image ? "lg:grid-cols-2 lg:items-center" : ""}`}
      wrapperClassName={wrapperClassName}
    >
      <div>
        <SectionHeading
          title={title}
          description={description}
          index={index}
          wide={wide}
          tag={id}
        />
      </div>
      {image ? (
        <FadeIn delay={150}>
          <Image
            src={image}
            alt=""
            width={800}
            height={600}
            className="aspect-4/3 w-full border-2 border-current object-cover grayscale contrast-125"
          />
        </FadeIn>
      ) : null}
    </Container>
  );
}
