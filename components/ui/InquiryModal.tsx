"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { CheckCircle2, X } from "lucide-react";
import { finishedFabricInquiryOptions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import { pushGenerateLead } from "@/lib/analytics/events";

const INQUIRY_SUBMISSION_TIMEOUT_MS = 15_000;

type InquirySubmissionPayload = {
  type: "single";
  submissionId: string;
  customer: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
  sourceUrl: string;
  honeypot: string;
  items: Array<{ name: string; quantity: string }>;
};

type InquirySubmissionOutcome =
  | { status: "success"; inquiryId: string }
  | { status: "error" };

type SharedInquiryOperation = {
  controller: AbortController;
  promise: Promise<InquirySubmissionOutcome>;
};

type SharedInquiryDraft = {
  name: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
  fabricId: string;
  quantity: string;
  website: string;
};

type SharedInquirySnapshot = {
  status: "idle" | "pending" | "success" | "error";
  submissionId: string | null;
  operation: SharedInquiryOperation | null;
  draft: SharedInquiryDraft | null;
};

const idleInquirySnapshot: SharedInquirySnapshot = {
  status: "idle",
  submissionId: null,
  operation: null,
  draft: null,
};

let sharedInquirySnapshot = idleInquirySnapshot;
const sharedInquiryListeners = new Set<() => void>();

function getSharedInquirySnapshot() {
  return sharedInquirySnapshot;
}

function setSharedInquirySnapshot(snapshot: SharedInquirySnapshot) {
  sharedInquirySnapshot = snapshot;
  sharedInquiryListeners.forEach((listener) => listener());
}

function updateSharedInquiryDraft<K extends keyof SharedInquiryDraft>(
  field: K,
  value: SharedInquiryDraft[K],
) {
  const snapshot = sharedInquirySnapshot;

  if (
    !snapshot.draft ||
    (snapshot.status !== "pending" && snapshot.status !== "error") ||
    snapshot.draft[field] === value
  ) {
    return;
  }

  setSharedInquirySnapshot({
    ...snapshot,
    draft: { ...snapshot.draft, [field]: value },
  });
}

function subscribeToSharedInquiry(listener: () => void) {
  sharedInquiryListeners.add(listener);
  return () => {
    sharedInquiryListeners.delete(listener);
  };
}

function resetSharedInquiryDraft() {
  if (sharedInquirySnapshot.status === "pending") return;
  setSharedInquirySnapshot(idleInquirySnapshot);
}

async function submitInquiryRequest(
  payload: InquirySubmissionPayload,
  controller: AbortController,
): Promise<InquirySubmissionOutcome> {
  const request = (async () => {
    const response = await fetch("/api/inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result = (await response.json()) as {
      success?: unknown;
      inquiryId?: unknown;
    } | null;

    if (
      response.ok &&
      result?.success === true &&
      typeof result.inquiryId === "string" &&
      result.inquiryId.trim()
    ) {
      return { status: "success", inquiryId: result.inquiryId } as const;
    }

    return { status: "error" } as const;
  })();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error("Inquiry submission timed out"));
    }, INQUIRY_SUBMISSION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

function startSharedInquiryOperation(
  payload: Omit<InquirySubmissionPayload, "submissionId">,
  draft: SharedInquiryDraft,
) {
  if (sharedInquirySnapshot.operation) return sharedInquirySnapshot.operation;

  const submissionId = sharedInquirySnapshot.submissionId ?? crypto.randomUUID();
  const controller = new AbortController();
  const promise: Promise<InquirySubmissionOutcome> = submitInquiryRequest(
    { ...payload, submissionId },
    controller,
  )
    .catch(() => ({ status: "error" as const }))
    .then((outcome) => {
      const currentSnapshot = sharedInquirySnapshot;
      if (currentSnapshot.operation?.controller !== controller) return outcome;

      if (outcome.status === "success") {
        pushGenerateLead("single_inquiry");
        setSharedInquirySnapshot({
          status: "success",
          submissionId: null,
          operation: null,
          draft: null,
        });
      } else {
        setSharedInquirySnapshot({
          ...currentSnapshot,
          status: "error",
          operation: null,
        });
      }

      return outcome;
    });
  const operation = { controller, promise };
  setSharedInquirySnapshot({ status: "pending", submissionId, operation, draft });
  return operation;
}

type InquiryModalProps = {
  open: boolean;
  onClose: () => void;
  initialFabricId?: string;
};

export function InquiryModal({ open, onClose, initialFabricId }: InquiryModalProps) {
  const { t } = useLocale();
  const titleId = useId();
  const inquiryOptions = finishedFabricInquiryOptions;
  const sharedSubmission = useSyncExternalStore(
    subscribeToSharedInquiry,
    getSharedInquirySnapshot,
    () => idleInquirySnapshot,
  );
  const mountedWithSharedDraft = useRef(sharedSubmission.draft !== null).current;
  const [name, setName] = useState(() => sharedSubmission.draft?.name ?? "");
  const [email, setEmail] = useState(() => sharedSubmission.draft?.email ?? "");
  const [company, setCompany] = useState(
    () => sharedSubmission.draft?.company ?? "",
  );
  const [phone, setPhone] = useState(() => sharedSubmission.draft?.phone ?? "");
  const [notes, setNotes] = useState(() => sharedSubmission.draft?.notes ?? "");
  const [fabricId, setFabricId] = useState(
    () => sharedSubmission.draft?.fabricId ?? "finished-range",
  );
  const [quantity, setQuantity] = useState(
    () => sharedSubmission.draft?.quantity ?? "",
  );
  const [website, setWebsite] = useState(
    () => sharedSubmission.draft?.website ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const submitting = sharedSubmission.status === "pending";
  const submitted = sharedSubmission.status === "success";
  const visibleError =
    error ?? (sharedSubmission.status === "error" ? t("inquirySubmitFailed") : null);

  const selectedFabric =
    inquiryOptions.find((option) => option.id === fabricId) ?? inquiryOptions[0];
  const fabricLabel = selectedFabric?.name ?? "";

  const handleClose = useCallback(() => {
    if (sharedInquirySnapshot.status === "pending") return;
    resetSharedInquiryDraft();
    setError(null);
    setName("");
    setEmail("");
    setCompany("");
    setPhone("");
    setNotes("");
    setFabricId("finished-range");
    setQuantity("");
    setWebsite("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open && submitted) successRef.current?.focus();
  }, [open, submitted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [handleClose, open]);

  useEffect(() => {
    if (open) {
      setError(null);
      if (!mountedWithSharedDraft) {
        setFabricId(
          initialFabricId && inquiryOptions.some((option) => option.id === initialFabricId)
            ? initialFabricId
            : "finished-range"
        );
      }
    }
  }, [initialFabricId, inquiryOptions, mountedWithSharedDraft, open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sharedInquirySnapshot.status === "pending") return;
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

    const draft: SharedInquiryDraft = {
      name,
      email,
      company,
      phone,
      notes,
      fabricId,
      quantity,
      website,
    };
    startSharedInquiryOperation(
      {
        type: "single",
        customer: name.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        sourceUrl: typeof window === "undefined" ? "" : window.location.href,
        honeypot: website.trim(),
        items: [{ name: fabricLabel, quantity: quantity.trim() }],
      },
      draft,
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-busy={submitting}
    >
      <button
        type="button"
        className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px]"
        aria-label={t("inquiryClose")}
        onClick={handleClose}
        disabled={submitting}
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
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div
            ref={successRef}
            role="status"
            aria-live="polite"
            tabIndex={-1}
            className="py-6 text-center outline-none"
          >
            <div className="mb-3 flex justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-base font-medium text-brand-charcoal">Submitted successfully</p>
            <p className="mt-2 text-sm text-brand-charcoal/70">{t("inquirySuccess")}</p>
            <Button type="button" className="mt-6 w-full" onClick={handleClose}>
              {t("inquiryOk")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="inquiry-website">Website</label>
              <input
                id="inquiry-website"
                name="website"
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  updateSharedInquiryDraft("website", e.target.value);
                }}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            {visibleError && (
              <p
                role="alert"
                aria-live="assertive"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {visibleError}
              </p>
            )}

            <div>
              <div className="relative">
                <input
                  id="inquiry-name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    updateSharedInquiryDraft("name", e.target.value);
                  }}
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
                  id="inquiry-phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    updateSharedInquiryDraft("phone", e.target.value);
                  }}
                  autoComplete="tel"
                  placeholder=" "
                  className="peer w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 pb-2 pt-5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
                />
                <label
                  htmlFor="inquiry-phone"
                  className="pointer-events-none absolute left-4 top-2 text-xs text-brand-charcoal/70 transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-brand-orange"
                >
                  {t("inquiryBatchPhone")}
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="inquiry-notes" className="mb-1 block text-sm text-brand-charcoal">
                {t("inquiryBatchNotes")}
              </label>
              <textarea
                id="inquiry-notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  updateSharedInquiryDraft("notes", e.target.value);
                }}
                placeholder={t("inquiryBatchNotesPlaceholder")}
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
              />
            </div>

            <div>
              <div className="relative">
                <input
                  id="inquiry-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    updateSharedInquiryDraft("email", e.target.value);
                  }}
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
                  onChange={(e) => {
                    setCompany(e.target.value);
                    updateSharedInquiryDraft("company", e.target.value);
                  }}
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
                onChange={(e) => {
                  setFabricId(e.target.value);
                  updateSharedInquiryDraft("fabricId", e.target.value);
                }}
                className="w-full rounded-2xl border border-gray-200 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-charcoal outline-none transition-all duration-200 ease-in-out focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50"
              >
                {inquiryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
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
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    updateSharedInquiryDraft("quantity", e.target.value);
                  }}
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
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
                disabled={submitting}
              >
                {t("inquiryCancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {t("inquirySubmit")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
