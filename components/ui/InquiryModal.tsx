"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { fabrics } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getFabricCopy, messages, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";

const STORAGE_KEY = "orange-textile-inquiries";

export type InquiryRecord = {
  name: string;
  email: string;
  company: string;
  fabric: string;
  quantity: string;
  createdAt: string;
};

type InquiryModalProps = {
  open: boolean;
  onClose: () => void;
};

function saveToLocalStorage(entry: Omit<InquiryRecord, "createdAt">): InquiryRecord {
  const full: InquiryRecord = {
    ...entry,
    createdAt: new Date().toISOString(),
  };
  const raw =
    typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  const list: InquiryRecord[] = raw ? JSON.parse(raw) : [];
  list.push(full);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return full;
}

function openMailto(entry: InquiryRecord, locale: Locale): void {
  const to = process.env.NEXT_PUBLIC_INQUIRY_EMAIL?.trim();
  if (!to) return;

  const m = messages[locale];
  const subject = encodeURIComponent(m.inquiryMailSubject);
  const body = encodeURIComponent(
    [
      `${m.inquiryMailName}: ${entry.name}`,
      `${m.inquiryMailEmail}: ${entry.email}`,
      `${m.inquiryMailCompany}: ${entry.company}`,
      `${m.inquiryMailFabric}: ${entry.fabric}`,
      `${m.inquiryMailQty}: ${entry.quantity}`,
      "",
      `${m.inquiryMailTime}: ${entry.createdAt}`,
    ].join("\n")
  );
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

export function InquiryModal({ open, onClose }: InquiryModalProps) {
  const { locale, t } = useLocale();
  const titleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [fabricId, setFabricId] = useState(fabrics[0]?.id ?? 1);
  const [quantity, setQuantity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFabric = fabrics.find((f) => f.id === fabricId) ?? fabrics[0];
  const fabricLabel = getFabricCopy(selectedFabric, locale).name;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError(t("inquiryErrNameEmail"));
      return;
    }
    if (!fabricLabel.trim()) {
      setError(t("inquiryErrFabric"));
      return;
    }
    if (!quantity.trim()) {
      setError(t("inquiryErrQty"));
      return;
    }

    const entry = saveToLocalStorage({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      fabric: fabricLabel,
      quantity: quantity.trim(),
    });

    if (process.env.NEXT_PUBLIC_INQUIRY_EMAIL) {
      openMailto(entry, locale);
    }

    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setCompany("");
    setFabricId(fabrics[0]?.id ?? 1);
    setQuantity("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px]"
        aria-label={t("inquiryClose")}
        onClick={handleClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-xl",
          "max-h-[90vh] overflow-y-auto"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-brand-charcoal">
              {t("inquiryTitle")}
            </h2>
            <p className="mt-1 text-sm text-brand-charcoal/70">{t("inquirySubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-brand-charcoal/60 transition-colors hover:bg-brand-soft hover:text-brand-charcoal"
            aria-label={t("inquiryClose")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-base font-medium text-brand-charcoal">{t("inquirySuccess")}</p>
            <Button type="button" className="mt-6 w-full" onClick={handleClose}>
              {t("inquiryOk")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <div>
              <label htmlFor="inquiry-name" className="mb-1 block text-sm text-brand-charcoal">
                {t("inquiryName")} <span className="text-brand-orange">*</span>
              </label>
              <input
                id="inquiry-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none ring-brand-orange/30 transition-shadow focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="inquiry-email" className="mb-1 block text-sm text-brand-charcoal">
                {t("inquiryEmail")} <span className="text-brand-orange">*</span>
              </label>
              <input
                id="inquiry-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none ring-brand-orange/30 transition-shadow focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="inquiry-company" className="mb-1 block text-sm text-brand-charcoal">
                {t("inquiryCompany")}
              </label>
              <input
                id="inquiry-company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none ring-brand-orange/30 transition-shadow focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="inquiry-fabric" className="mb-1 block text-sm text-brand-charcoal">
                {t("inquiryFabric")} <span className="text-brand-orange">*</span>
              </label>
              <select
                id="inquiry-fabric"
                name="fabric"
                value={fabricId}
                onChange={(e) => setFabricId(Number(e.target.value))}
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none ring-brand-orange/30 transition-shadow focus:ring-2"
              >
                {fabrics.map((f) => (
                  <option key={f.id} value={f.id}>
                    {getFabricCopy(f, locale).name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="inquiry-qty" className="mb-1 block text-sm text-brand-charcoal">
                {t("inquiryQuantity")} <span className="text-brand-orange">*</span>
              </label>
              <input
                id="inquiry-qty"
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t("inquiryQtyPlaceholder")}
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none ring-brand-orange/30 transition-shadow focus:ring-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                {t("inquiryCancel")}
              </Button>
              <Button type="submit" className="flex-1">
                {t("inquirySubmit")}
              </Button>
            </div>

            <p className="text-center text-xs text-brand-charcoal/50">{t("inquiryFootnote")}</p>
          </form>
        )}
      </div>
    </div>
  );
}
