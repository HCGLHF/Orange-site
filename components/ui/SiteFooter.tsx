import Link from "next/link";
import { companyRelationship } from "@/lib/company-evidence";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/fabrics", label: "Finished fabrics" },
  {
    href: "/finished-double-knit-fabrics",
    label: "Double-knit manufacturing",
  },
  {
    href: "/custom-knit-fabric-development",
    label: "Custom development",
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-soft bg-white px-5 pb-40 pt-10 text-brand-charcoal sm:px-6 md:pb-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="text-base font-semibold">
            {companyRelationship.brandName}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/80">
            {companyRelationship.exportCompany} · Export-focused knit fabric
            sourcing from Shaoxing Keqiao.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-brand-charcoal/80 underline-offset-4 transition-colors hover:text-brand-charcoal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-charcoal focus-visible:ring-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
