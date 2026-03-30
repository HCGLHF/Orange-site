import { Button } from "@/components/ui/Button";
import { FabricCard } from "@/components/ui/FabricCard";
import { Navbar } from "@/components/ui/Navbar";
import { fabrics } from "@/lib/data";

export default function Home() {
  return (
    <div className="bg-brand-cream text-brand-charcoal">
      <Navbar />

      <main>
        <section
          id="home"
          className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center"
        >
          <p className="mb-4 rounded-full bg-brand-soft px-4 py-1 text-sm text-brand-charcoal/80">
            Shaoxing Textile Trading
          </p>
          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
            O&apos;range 诗橙
          </h1>
          <p className="mt-5 text-lg text-brand-charcoal/80 md:text-xl">
            Soft Touch from Shaoxing
          </p>
          <Button className="mt-10">免费索取样品</Button>
        </section>

        <section id="fabrics" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-semibold">Featured Fabrics</h2>
            <p className="text-sm text-brand-charcoal/70">精选针织面料</p>
          </div>
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
            {fabrics.map((fabric) => (
              <div key={fabric.id} className="snap-start">
                <FabricCard fabric={fabric} />
              </div>
            ))}
          </div>
        </section>

        <section id="story" className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
            <p className="mb-3 text-sm uppercase tracking-[0.18em] text-brand-orange">
              Brand Story
            </p>
            <h3 className="text-3xl font-semibold md:text-4xl">触感如诗，橙色温度</h3>
            <p className="mt-4 max-w-3xl leading-relaxed text-brand-charcoal/80">
              我们扎根绍兴，以稳定织造、细腻手感和快速响应服务全球客户。
              O&apos;range 诗橙坚持把每一匹面料做到可感知的温度，让设计灵感从触感开始。
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="px-6 pb-24 pt-6 text-center text-sm text-brand-charcoal/70">
        绍兴诗橙纺织品贸易公司 · 欢迎洽询合作
      </footer>
    </div>
  );
}
