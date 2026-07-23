import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";
import {
  certificationEvidence,
  companyRelationship,
} from "@/lib/company-evidence";

export function HomeCertificateSection() {
  return (
    <section
      aria-labelledby="grs-scope-heading"
      className="border-y border-brand-soft bg-white px-5 py-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-orange">
          <FileCheck2 className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-charcoal">
            Certificates
          </p>
          <h2
            id="grs-scope-heading"
            className="mt-2 text-2xl font-semibold text-brand-charcoal"
          >
            GRS Scope Documentation
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
            Our parent company, {companyRelationship.parentCompany}, holds a{" "}
            {certificationEvidence.shortName} v{certificationEvidence.version}{" "}
            scope certificate covering {certificationEvidence.productCategory.toLowerCase()} ({" "}
            {certificationEvidence.productDetail.toLowerCase()}) and{" "}
            {certificationEvidence.process.toLowerCase()}. Documentation for applicable sourcing
            requests is reviewed case by case.
          </p>
          <p className="mt-3 max-w-3xl border-l-2 border-brand-orange pl-3 text-xs leading-6 text-brand-charcoal/70">
            {certificationEvidence.qualification}
          </p>
        </div>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-charcoal underline decoration-brand-orange decoration-2 underline-offset-4 hover:text-brand-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-4"
        >
          Learn about our company
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
