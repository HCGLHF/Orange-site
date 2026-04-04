"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { CheckCircle2, X } from "lucide-react";
import { fabrics } from "@/lib/data";
import {
  appendInquiryRecord,
  FORMSPREE_INQUIRY_ENDPOINT,
  type InquiryRecord,
} from "@/lib/inquiry-storage";
import { cn } from "@/lib/utils";
import { getFabricCopy } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";

export type { InquiryRecord };

type InquiryModalProps = {
  open: boolean;
  onClose: () => void;
};

export function InquiryModal({ open, onClose }: InquiryModalProps) {
  const { locale, t } = useLocale();
  const titleId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [fabricId, setFabricId] = useState(fabrics[0]?.id ?? "1");
  const [quantity, setQuantity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
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

    const entry = appendInquiryRecord({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      fabric: fabricLabel,
      quantity: quantity.trim(),
    });

    try {
      setSubmitting(true);
      const response = await fetch(FORMSPREE_INQUIRY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: entry.name,
          email: entry.email,
          company: entry.company,
          fabric: entry.fabric,
          message: entry.quantity,
          _subject: `【官网询盘】${entry.company || entry.name} - ${entry.fabric}`,
        }),
      });

      if (response.ok) {
        alert("✅ 提交成功！我们会尽快联系您。");
        handleClose();
      } else {
        alert("❌ 提交失败，请直接邮件联系");
      }
    } catch (submitError) {
      console.error(submitError);
      alert("❌ 网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setCompany("");
    setFabricId(fabrics[0]?.id ?? "1");
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
            <div className="mb-3 flex justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
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
              <div className="relative">
                <input
                  id="inquiry-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder=" "
                  className="peer w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 pb-2 pt-5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
                />
                <label
                  htmlFor="inquiry-name"
                  className="pointer-events-none absolute left-4 top-2 text-xs text-brand-charcoal/70 transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-brand-orange"
                >
                  {t("inquiryName")} <span className="text-brand-orange">*</span>
                </label>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  id="inquiry-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder=" "
                  className="peer w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 pb-2 pt-5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
                />
                <label
                  htmlFor="inquiry-email"
                  className="pointer-events-none absolute left-4 top-2 text-xs text-brand-charcoal/70 transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-brand-orange"
                >
                  {t("inquiryEmail")} <span className="text-brand-orange">*</span>
                </label>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  id="inquiry-company"
                  name="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  placeholder=" "
                  className="peer w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 pb-2 pt-5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
                />
                <label
                  htmlFor="inquiry-company"
                  className="pointer-events-none absolute left-4 top-2 text-xs text-brand-charcoal/70 transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-brand-orange"
                >
                  {t("inquiryCompany")}
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="inquiry-fabric" className="mb-1 block text-sm text-brand-charcoal">
                {t("inquiryFabric")} <span className="text-brand-orange">*</span>
              </label>
              <select
                id="inquiry-fabric"
                name="fabric"
                value={fabricId}
                onChange={(e) => setFabricId(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
              >
                {fabrics.map((f) => (
                  <option key={f.id} value={f.id}>
                    {getFabricCopy(f, locale).name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="relative">
                <input
                  id="inquiry-qty"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder=" "
                  className="peer w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 pb-2 pt-5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
                />
                <label
                  htmlFor="inquiry-qty"
                  className="pointer-events-none absolute left-4 top-2 text-xs text-brand-charcoal/70 transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-brand-orange"
                >
                  {t("inquiryQuantity")} <span className="text-brand-orange">*</span>
                </label>
              </div>
              <p className="mt-1 pl-1 text-xs text-brand-charcoal/55">{t("inquiryQtyPlaceholder")}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                {t("inquiryCancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
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
