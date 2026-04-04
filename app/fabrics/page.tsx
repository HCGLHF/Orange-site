import type { Metadata } from "next";
import { Suspense } from "react";
import { FabricsCatalog } from "@/components/FabricsCatalog";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { FabricsPageIntro } from "@/components/FabricsPageIntro";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { resolveFabricsFromNotion } from "@/lib/fabrics";

export const metadata: Metadata = {
  title: "面料库 | 绍兴诗橙纺织品有限公司",
  description: "绍兴诗橙纺织品有限公司精选针织面料展示",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FabricsPage() {
  const { fabrics, notionEmpty: emptyFromNotion } =
    await resolveFabricsFromNotion();

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <LanguageToggle />

      <div className="pb-28 max-md:pb-44 md:pb-12">
        <div className="border-b border-brand-soft/40 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <FabricsPageIntro />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {emptyFromNotion ? (
            <p className="text-brand-charcoal/60">暂无数据</p>
          ) : (
            <Suspense
              fallback={
                <div className="py-16 text-center text-sm text-brand-charcoal/60">
                  加载中…
                </div>
              }
            >
              <FabricsCatalog fabrics={fabrics} />
            </Suspense>
          )}
        </div>

        {!emptyFromNotion ? <FabricsInquiryAnchor /> : null}
      </div>

      <BottomNav />
    </div>
  );
}
