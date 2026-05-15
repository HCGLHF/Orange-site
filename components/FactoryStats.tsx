"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { Clock, Factory, Globe, Package } from "lucide-react";
import { useInView, useReducedMotion } from "framer-motion";

type StatItem = {
  icon: ComponentType<{ className?: string }>;
  target: number;
  label: string;
  unit?: string;
  plus?: boolean;
};

const stats: StatItem[] = [
  { icon: Factory, target: 20000, unit: "m2", label: "Modern production floor" },
  { icon: Package, target: 3000, unit: "m/day", label: "Daily capacity" },
  { icon: Globe, target: 50, plus: true, unit: " countries", label: "Global clients served" },
  { icon: Clock, target: 48, unit: "h", label: "Sampling turnaround" },
];

function CountUpNumber({
  target,
  unit = "",
  plus = false,
}: {
  target: number;
  unit?: string;
  plus?: boolean;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setValue(target);
      return;
    }

    const duration = 1000;
    const start = performance.now();
    let rafId = 0;
    let lastRendered = -1;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.floor(target * eased);
      if (nextValue !== lastRendered) {
        lastRendered = nextValue;
        setValue(nextValue);
      }
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, reduceMotion, target]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {plus ? "+" : ""}
      {unit}
    </span>
  );
}

export default function FactoryStats() {
  return (
    <section className="bg-gradient-to-b from-brand-cream to-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="rounded-3xl border border-brand-soft bg-white p-8 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-orange">
                  <Icon className="h-7 w-7" />
                </div>
                <p className="text-4xl font-semibold text-brand-charcoal md:text-5xl">
                  <CountUpNumber target={item.target} unit={item.unit} plus={item.plus} />
                </p>
                <p className="mt-2 text-sm text-brand-charcoal/70">{item.label}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
