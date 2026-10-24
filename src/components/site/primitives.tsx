import { useState, type ReactNode } from "react";
import { UtensilsCrossed } from "lucide-react";
import { srcSetFor } from "@/lib/images";
import { cn } from "@/lib/utils";

export function SafeImage({
  src,
  alt,
  className,
  eager,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  src?: string | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
  /** How wide the image is shown, so the browser can pick the smallest file that fits. */
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-secondary text-muted-foreground/60",
          className,
        )}
      >
        <UtensilsCrossed className="size-8" strokeWidth={1.3} />
      </div>
    );
  }
  const srcSet = srcSetFor(src);
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

/** Plain wrapper (scroll reveals were removed on purpose). `delay` is accepted for older call sites. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("mb-10 max-w-2xl", center && "mx-auto text-center")}>
      <h2 className="text-4xl md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 max-w-xl text-lg text-muted-foreground">{subtitle}</p>}
      {eyebrow && null}
    </div>
  );
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-md border-2 border-foreground bg-background">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="h-8 w-8 text-lg font-semibold hover:text-primary disabled:opacity-30"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span className="w-7 text-center text-base font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="h-8 w-8 text-lg font-semibold hover:text-primary"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

export const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
