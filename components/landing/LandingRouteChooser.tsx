import Link from "next/link";
import { ArrowRight, Boxes, Layers3, Ruler } from "lucide-react";

export type LandingRoute = {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: "stock" | "range" | "custom";
};

const routeIcons = {
  stock: Boxes,
  range: Layers3,
  custom: Ruler,
};

export function LandingRouteChooser({ routes }: { routes: LandingRoute[] }) {
  return (
    <section className="bg-white px-5 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-brand-orange">Choose a sourcing route</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-charcoal md:text-4xl">
            Start with the decision you need to make
          </h2>
          <p className="mt-4 text-base leading-8 text-brand-charcoal/70">
            Each route opens a different buyer page, so stock selection, finished-fabric comparison and custom development no longer lead to the same generic catalogue view.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {routes.map((route) => {
            const Icon = routeIcons[route.icon];
            return (
              <Link
                key={route.href}
                href={route.href}
                className="group flex min-h-72 flex-col border border-brand-soft bg-brand-cream p-6 transition hover:border-brand-orange hover:bg-white"
              >
                <span className="flex h-11 w-11 items-center justify-center bg-brand-soft text-brand-orange">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-8 text-xl font-semibold text-brand-charcoal">{route.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-brand-charcoal/70">{route.description}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
                  {route.action}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
