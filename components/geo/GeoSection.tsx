import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold text-brand-charcoal md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-brand-charcoal/75">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-brand-soft bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-brand-charcoal">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-brand-charcoal/75">
        {children}
      </div>
    </article>
  );
}
