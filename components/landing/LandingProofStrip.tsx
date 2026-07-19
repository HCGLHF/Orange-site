import type { LandingProofPoint } from "@/lib/landing-page-content";

export function LandingProofStrip({ points }: { points: LandingProofPoint[] }) {
  const visiblePoints = points.filter((point) => point.enabled);

  if (visiblePoints.length === 0) return null;

  return (
    <section aria-label="Verified production facts" className="border-b border-white/10 bg-brand-charcoal text-white">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-6 lg:grid-cols-4 lg:px-8">
        {visiblePoints.map((point) => (
          <div key={point.label} className="min-h-28 border-white/15 px-3 py-6 even:border-l lg:border-l lg:first:border-l-0 lg:px-6">
            <dt className="text-xs font-semibold uppercase text-[#F2B7A5]">
              {point.label}
            </dt>
            <dd className="mt-2 text-sm font-medium leading-6 text-white/90 sm:text-base">
              {point.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
