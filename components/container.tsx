import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Container({
  children,
  className,
  wrapperClassName,
  ...props
}: ContainerProps) {
  return (
    <section
      className={cn("w-full px-4 py-20 sm:px-8 sm:py-28", wrapperClassName)}
    >
      <div className={cn("mx-auto max-w-7xl", className)} {...props}>
        {children}
      </div>
    </section>
  );
}
