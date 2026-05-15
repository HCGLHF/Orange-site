"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Check, Package, Send, X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import {
  appendInquiryRecord,
  FORMSPREE_INQUIRY_ENDPOINT,
} from "@/lib/inquiry-storage";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

export function InquiryBar() {
  const { t } = useLocale();
  const { items, totalCount, removeItem, updateQuantity, clearCart } =
    useInquiryCart();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const titleId = useId();

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowForm(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showForm]);

  useEffect(() => {
    if (showForm) {
      setSubmitted(false);
      setError(null);
      setFormKey((k) => k + 1);
    }
  }, [showForm]);

  useEffect(() => {
    const open = () => setShowForm(true);
    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, open);
    return () => window.removeEventListener(OPEN_BATCH_INQUIRY_EVENT, open);
  }, []);

  if (totalCount === 0) return null;

  const subtitle = t("inquiryBatchSubtitle").replace(
    "{count}",
    String(totalCount)
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const customer = String(formData.get("customer") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    if (!customer || !email) {
      setError(t("inquiryErrNameEmail"));
      return;
    }
    if (!phone) {
      setError(t("inquiryErrPhone"));
      return;
    }

    const lines = items.map(
      (i) =>
        `${i.name} | ${i.quantity}m | ${i.composition} | ${i.weight}g | ${i.stockStatus}`
    );
    const fabricField = `Batch inquiry: ${items.length} fabrics\n${lines.join("\n")}`;
    const quantityField = `Phone: ${phone}${notes ? `\nNotes: ${notes}` : ""}`;

    appendInquiryRecord({
      name: customer,
      email,
      company,
      fabric: fabricField,
      quantity: quantityField,
    });

    const submitPayload = {
      customer,
      company,
      phone,
      email,
      notes,
      items: items.map((i) => ({
        notionPageId: i.notionPageId ?? null,
        name: i.name,
        quantityMeters: i.quantity,
        composition: i.composition,
        weight: i.weight,
        stockStatus: i.stockStatus,
      })),
    };

    const formspreeBody = {
      name: customer,
      email,
      company,
      fabric: fabricField,
      message: quantityField,
      _subject: `[Website batch inquiry] ${company || customer} | ${items.length} fabrics`,
    };

    try {
      setSubmitting(true);
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(submitPayload),
      });

      let result: {
        success?: boolean;
        skipped?: boolean;
        error?: string;
      };
      try {
        result = (await response.json()) as typeof result;
      } catch {
        setError(t("inquirySubmitFailed"));
        return;
      }

      if (!response.ok || !result.success) {
        setError(result.error || t("inquirySubmitFailed"));
        return;
      }

      if (result.skipped) {
        const fsRes = await fetch(FORMSPREE_INQUIRY_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formspreeBody),
        });
        if (!fsRes.ok) {
          setError(t("inquirySubmitFailed"));
          return;
        }
      } else {
        void fetch(FORMSPREE_INQUIRY_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formspreeBody),
        }).catch(() => {});
      }

      form.reset();
      setSubmitted(true);
      setTimeout(() => {
        clearCart();
        setShowForm(false);
        setSubmitted(false);
      }, 3000);
    } catch {
      setError(t("inquirySubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setError(null);
  };

  return (
    <>
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={t("inquiryClose")}
            onClick={closeForm}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-gray-200 bg-white p-6">
              <div>
                <h2 id={titleId} className="text-xl font-bold text-gray-900">
                  {t("inquiryBatchTitle")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                aria-label={t("inquiryClose")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("inquiryBatchSuccessTitle")}
                </h3>
                <p className="mt-2 text-gray-500">{t("inquiryBatchSuccessBody")}</p>
              </div>
            ) : (
              <form key={formKey} onSubmit={handleSubmit} className="space-y-6 p-6">
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                    <Package className="h-4 w-4" aria-hidden />
                    {t("inquiryBatchListTitle")}
                  </h3>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.composition} | {item.weight}g
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="whitespace-nowrap text-xs text-gray-500">
                            {t("inquiryBatchQty")}:
                          </label>
                          <input
                            type="number"
                            min={10}
                            step={10}
                            value={item.quantity}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              if (!Number.isNaN(v)) {
                                updateQuantity(item.id, Math.max(10, v));
                              }
                            }}
                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                          />
                          <span className="text-xs text-gray-500">
                            {t("inquiryBatchMeters")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600"
                          aria-label={t("inquiryBatchRemoveLine")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("inquiryName")} <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      required
                      name="customer"
                      type="text"
                      autoComplete="name"
                      placeholder={t("inquiryPhCustomer")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("inquiryCompany")}
                    </label>
                    <input
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder={t("inquiryPhCompanyBatch")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("inquiryBatchPhone")}{" "}
                      <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder={t("inquiryPhPhone")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {t("inquiryEmail")} <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      required
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("inquiryPhEmail")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("inquiryBatchNotes")}
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder={t("inquiryBatchNotesPlaceholder")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-5 w-5 shrink-0" aria-hidden />
                  {t("inquiryBatchSubmit")}
                </button>

                <p className="text-center text-xs text-gray-500">
                  {t("inquiryBatchFootnote")}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
