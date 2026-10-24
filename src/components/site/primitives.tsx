import { useEffect, useRef, useState, type ReactNode } from "react";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function SafeImage({
  src,
  alt,
  className,
  eager,
}: {
  src?: string | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
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
        <UtensilsCrossed className="size-10" strokeWidth={1.3} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", vis && "is-visible", className)}
    >
      {children}
    </div>
  );
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
    <Reveal className={cn("mb-12 max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </Reveal>
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
    <div className="inline-flex items-center rounded-full border border-border bg-background">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="h-9 w-9 rounded-full text-lg hover:text-primary disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="h-9 w-9 rounded-full text-lg hover:text-primary"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

export const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
