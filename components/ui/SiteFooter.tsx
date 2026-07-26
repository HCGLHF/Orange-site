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
    <footer className="sf">
      <div className="sf-inner">
        <div>
          <p className="sf-brand">
            {companyRelationship.brandName}
          </p>
          <p className="sf-copy">
            {companyRelationship.exportCompany} · Export-focused knit fabric
            sourcing from Shaoxing Keqiao.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="sf-links">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="sf-link"
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
