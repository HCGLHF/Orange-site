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
import { Check, Package, Send, X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import {
  useInquiryCart,
  type CartItem,
} from "@/components/InquiryCartProvider";
import {
  getOpenBatchInquiryOpeners,
  OPEN_BATCH_INQUIRY_EVENT,
  restoreInquiryFocus,
} from "@/lib/inquiry-events";
import { pushGenerateLead } from "@/lib/analytics/events";

const BATCH_INQUIRY_TIMEOUT_MS = 15_000;

type BatchInquiryItem = {
  name: string;
  quantity: string;
  composition?: string;
  weight?: string;
  stockStatus?: string;
};

type BatchInquiryPayload = {
  type: "batch";
  submissionId: string;
  customer: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
  sourceUrl: string;
  honeypot: string;
  items: BatchInquiryItem[];
};

type BatchInquiryOutcome =
  | { status: "success"; inquiryId: string }
  | { status: "error" };

type SharedBatchOperation = {
  controller: AbortController;
  promise: Promise<BatchInquiryOutcome>;
};

type SharedBatchDraft = {
  customer: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
  website: string;
};

type SubmittedCartEntry = {
  id: string;
  quantity: number;
  identity: CartItem;
};

type SharedBatchSnapshot = {
  status: "idle" | "pending" | "success" | "error";
  submissionId: string | null;
  payloadKey: string | null;
  operation: SharedBatchOperation | null;
  draft: SharedBatchDraft | null;
  submittedCart: SubmittedCartEntry[] | null;
};

const idleBatchSnapshot: SharedBatchSnapshot = {
  status: "idle",
  submissionId: null,
  payloadKey: null,
  operation: null,
  draft: null,
  submittedCart: null,
};

let sharedBatchSnapshot = idleBatchSnapshot;
const sharedBatchListeners = new Set<() => void>();

function getSharedBatchSnapshot() {
  return sharedBatchSnapshot;
}

function setSharedBatchSnapshot(snapshot: SharedBatchSnapshot) {
  sharedBatchSnapshot = snapshot;
  sharedBatchListeners.forEach((listener) => listener());
}

function subscribeToSharedBatch(listener: () => void) {
  sharedBatchListeners.add(listener);
  return () => {
    sharedBatchListeners.delete(listener);
  };
}

function updateSharedBatchDraft<K extends keyof SharedBatchDraft>(
  field: K,
  value: SharedBatchDraft[K],
) {
  const snapshot = sharedBatchSnapshot;
  if (
    !snapshot.draft ||
    (snapshot.status !== "pending" && snapshot.status !== "error") ||
    snapshot.draft[field] === value
  ) {
    return;
  }

  setSharedBatchSnapshot({
    ...snapshot,
    draft: { ...snapshot.draft, [field]: value },
  });
}

function resetSharedBatchDraft() {
  if (sharedBatchSnapshot.status === "pending") return;
  setSharedBatchSnapshot(idleBatchSnapshot);
}

export function resetBatchInquiryStateForTests() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Batch inquiry state can only be reset by tests");
  }

  const operation = sharedBatchSnapshot.operation;
  setSharedBatchSnapshot(idleBatchSnapshot);
  operation?.controller.abort();
}

function claimSubmittedCartReconciliation(snapshot: SharedBatchSnapshot) {
  const currentSnapshot = sharedBatchSnapshot;
  if (
    currentSnapshot !== snapshot ||
    currentSnapshot.status !== "success" ||
    currentSnapshot.submittedCart === null
  ) {
    return null;
  }

  const submittedCart = currentSnapshot.submittedCart;
  setSharedBatchSnapshot({
    ...currentSnapshot,
    submittedCart: null,
  });
  return submittedCart;
}

async function submitBatchInquiryRequest(
  payload: BatchInquiryPayload,
  controller: AbortController,
): Promise<BatchInquiryOutcome> {
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
      reject(new Error("Batch inquiry submission timed out"));
    }, BATCH_INQUIRY_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

function startSharedBatchOperation(
  payload: Omit<BatchInquiryPayload, "submissionId">,
  draft: SharedBatchDraft,
  submittedCart: SubmittedCartEntry[],
) {
  if (sharedBatchSnapshot.operation) return sharedBatchSnapshot.operation;

  const payloadKey = JSON.stringify(payload);
  const submissionId =
    sharedBatchSnapshot.submissionId !== null &&
    sharedBatchSnapshot.payloadKey === payloadKey
      ? sharedBatchSnapshot.submissionId
      : crypto.randomUUID();
  const controller = new AbortController();
  const promise: Promise<BatchInquiryOutcome> = submitBatchInquiryRequest(
    { ...payload, submissionId },
    controller,
  )
    .catch(() => ({ status: "error" as const }))
    .then((outcome) => {
      const currentSnapshot = sharedBatchSnapshot;
      if (currentSnapshot.operation?.controller !== controller) return outcome;

      if (outcome.status === "success") {
        pushGenerateLead("batch_inquiry");
        setSharedBatchSnapshot({
          status: "success",
          submissionId: null,
          payloadKey: null,
          operation: null,
          draft: null,
          submittedCart: currentSnapshot.submittedCart,
        });
      } else {
        setSharedBatchSnapshot({
          ...currentSnapshot,
          status: "error",
          operation: null,
        });
      }

      return outcome;
    });
  const operation = { controller, promise };
  setSharedBatchSnapshot({
    status: "pending",
    submissionId,
    payloadKey,
    operation,
    draft,
    submittedCart,
  });
  return operation;
}

type InquiryBarProps = {
  initiallyOpen?: boolean;
  initialOpener?: HTMLElement | null;
  initialFallbackOpener?: HTMLElement | null;
  onOpenListenerReady?: () => void;
};

export function InquiryBar({
  initiallyOpen = false,
  initialOpener = null,
  initialFallbackOpener = null,
  onOpenListenerReady,
}: InquiryBarProps = {}) {
  const { t } = useLocale();
  const { items, totalCount, removeItem, updateQuantity } = useInquiryCart();
  const sharedSubmission = useSyncExternalStore(
    subscribeToSharedBatch,
    getSharedBatchSnapshot,
    () => idleBatchSnapshot,
  );
  const [showForm, setShowForm] = useState(
    () => initiallyOpen || sharedSubmission.status !== "idle",
  );
  const [customer, setCustomer] = useState(
    () => sharedSubmission.draft?.customer ?? "",
  );
  const [company, setCompany] = useState(
    () => sharedSubmission.draft?.company ?? "",
  );
  const [phone, setPhone] = useState(
    () => sharedSubmission.draft?.phone ?? "",
  );
  const [email, setEmail] = useState(
    () => sharedSubmission.draft?.email ?? "",
  );
  const [notes, setNotes] = useState(
    () => sharedSubmission.draft?.notes ?? "",
  );
  const [website, setWebsite] = useState(
    () => sharedSubmission.draft?.website ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(
    initialOpener?.isConnected ? initialOpener : null,
  );
  const fallbackOpenerRef = useRef<HTMLElement | null>(
    initialFallbackOpener?.isConnected ? initialFallbackOpener : null,
  );
  const wasOpenRef = useRef(showForm);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const submitting = sharedSubmission.status === "pending";
  const submitted = sharedSubmission.status === "success";
  const visibleError =
    error ??
    (sharedSubmission.status === "error" ? t("inquirySubmitFailed") : null);

  const restoreOpenerFocus = useCallback(() => {
    const opener = openerRef.current;
    const fallbackOpener = fallbackOpenerRef.current;
    openerRef.current = null;
    fallbackOpenerRef.current = null;
    restoreInquiryFocus(opener, fallbackOpener);
  }, []);

  const closeForm = useCallback(() => {
    if (sharedBatchSnapshot.status === "pending") return;
    resetSharedBatchDraft();
    setCustomer("");
    setCompany("");
    setPhone("");
    setEmail("");
    setNotes("");
    setWebsite("");
    setError(null);
    setShowForm(false);
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeForm();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      const focusableElements = Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) =>
          !element.closest('[hidden], [aria-hidden="true"]'),
      );

      if (!panel || focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstFocusable ||
          activeElement === panel ||
          !panel.contains(activeElement))
      ) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }

      if (
        !event.shiftKey &&
        (activeElement === lastFocusable ||
          activeElement === panel ||
          !panel.contains(activeElement))
      ) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [closeForm, showForm]);

  useEffect(() => {
    if (!showForm) return;

    if (!openerRef.current?.isConnected) {
      openerRef.current = null;
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        activeElement !== document.body &&
        !panelRef.current?.contains(activeElement)
      ) {
        openerRef.current = activeElement;
      }
    }
    if (!fallbackOpenerRef.current?.isConnected) {
      fallbackOpenerRef.current = null;
    }

    if (submitting || submitted || visibleError) return;
    closeButtonRef.current?.focus();
  }, [showForm, submitting, submitted, visibleError]);

  useEffect(() => {
    if (showForm) {
      wasOpenRef.current = true;
      return;
    }

    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;
    restoreOpenerFocus();
  }, [restoreOpenerFocus, showForm]);

  useEffect(() => {
    if (showForm) setError(null);
  }, [showForm]);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  useEffect(() => {
    if (visibleError) errorRef.current?.focus();
  }, [visibleError]);

  useEffect(() => {
    if (showForm && submitting) panelRef.current?.focus();
  }, [showForm, submitting]);

  useEffect(() => {
    const submittedCart = claimSubmittedCartReconciliation(sharedSubmission);
    if (!submittedCart) return;

    for (const submittedEntry of submittedCart) {
      const currentItem = items.find((item) => item.id === submittedEntry.id);
      if (
        currentItem === submittedEntry.identity &&
        currentItem.quantity === submittedEntry.quantity
      ) {
        removeItem(submittedEntry.id);
      }
    }
  }, [items, removeItem, sharedSubmission]);

  useEffect(() => {
    const open = (event: Event) => {
      const { opener, fallbackOpener } = getOpenBatchInquiryOpeners(event);
      openerRef.current = opener;
      fallbackOpenerRef.current = fallbackOpener;
      setShowForm(true);
    };
    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, open);
    onOpenListenerReady?.();
    return () => {
      window.removeEventListener(OPEN_BATCH_INQUIRY_EVENT, open);
    };
  }, [onOpenListenerReady]);

  useEffect(() => {
    return restoreOpenerFocus;
  }, [restoreOpenerFocus]);

  if (totalCount === 0 && !showForm && sharedSubmission.status === "idle") {
    return null;
  }

  const subtitle = t("inquiryBatchSubtitle").replace(
    "{count}",
    String(totalCount)
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sharedBatchSnapshot.status === "pending") return;
    setError(null);

    if (!customer.trim() || !email.trim()) {
      setError(t("inquiryErrNameEmail"));
      return;
    }
    if (!phone.trim()) {
      setError(t("inquiryErrPhone"));
      return;
    }
    if (items.length === 0) {
      setError(t("inquirySubmitFailed"));
      return;
    }

    const draft: SharedBatchDraft = {
      customer,
      company,
      phone,
      email,
      notes,
      website,
    };
    startSharedBatchOperation(
      {
        type: "batch",
        customer: customer.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        sourceUrl:
          typeof window === "undefined"
            ? ""
            : `${window.location.origin}${window.location.pathname}`,
        honeypot: website.trim(),
        items: items.map((item) => ({
          name: item.name,
          quantity: `${item.quantity} m`,
          ...(item.composition.trim()
            ? { composition: item.composition.trim() }
            : {}),
          ...(item.weightLabel?.trim()
            ? { weight: item.weightLabel.trim() }
            : Number.isFinite(item.weight) && item.weight > 0
              ? { weight: `${item.weight} gsm` }
              : {}),
          ...(item.stockStatus.trim()
            ? { stockStatus: item.stockStatus.trim() }
            : {}),
        })),
      },
      draft,
      items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        identity: item,
      })),
    );
  };

  return (
    <>
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-busy={submitting}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={t("inquiryClose")}
            onClick={closeForm}
            disabled={submitting}
          />
          <div
            ref={panelRef}
            role="document"
            tabIndex={-1}
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-gray-200 bg-white p-6">
              <div>
                <h2 id={titleId} className="text-xl font-bold text-gray-900">
                  {t("inquiryBatchTitle")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
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
                className="p-12 text-center outline-none"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("inquiryBatchSuccessTitle")}
                </h3>
                <p className="mt-2 text-gray-500">{t("inquiryBatchSuccessBody")}</p>
                <button
                  type="button"
                  onClick={closeForm}
                  className="mt-6 w-full rounded-xl bg-brand-orange py-3 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t("inquiryOk")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <fieldset
                  disabled={submitting}
                  className="min-w-0 space-y-6 border-0 p-6"
                >
                <div
                  className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="batch-inquiry-website">Website</label>
                  <input
                    id="batch-inquiry-website"
                    name="website"
                    type="text"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                      updateSharedBatchDraft("website", e.target.value);
                    }}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>

                {visibleError && (
                  <p
                    ref={errorRef}
                    role="alert"
                    aria-live="assertive"
                    tabIndex={-1}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 outline-none"
                  >
                    {visibleError}
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
                          {item.composition} | {item.weightLabel?.trim() ||
                            (Number.isFinite(item.weight) && item.weight > 0
                              ? `${item.weight} GSM`
                              : "Confirm GSM")}
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
                    <label
                      htmlFor="batch-inquiry-customer"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {t("inquiryName")} <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      id="batch-inquiry-customer"
                      required
                      name="customer"
                      type="text"
                      value={customer}
                      onChange={(e) => {
                        setCustomer(e.target.value);
                        updateSharedBatchDraft("customer", e.target.value);
                      }}
                      autoComplete="name"
                      placeholder={t("inquiryPhCustomer")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="batch-inquiry-company"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {t("inquiryCompany")}
                    </label>
                    <input
                      id="batch-inquiry-company"
                      name="company"
                      type="text"
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        updateSharedBatchDraft("company", e.target.value);
                      }}
                      autoComplete="organization"
                      placeholder={t("inquiryPhCompanyBatch")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="batch-inquiry-phone"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {t("inquiryBatchPhone")}{" "}
                      <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      id="batch-inquiry-phone"
                      required
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        updateSharedBatchDraft("phone", e.target.value);
                      }}
                      autoComplete="tel"
                      placeholder={t("inquiryPhPhone")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="batch-inquiry-email"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {t("inquiryEmail")} <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      id="batch-inquiry-email"
                      required
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        updateSharedBatchDraft("email", e.target.value);
                      }}
                      autoComplete="email"
                      placeholder={t("inquiryPhEmail")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="batch-inquiry-notes"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t("inquiryBatchNotes")}
                  </label>
                  <textarea
                    id="batch-inquiry-notes"
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      updateSharedBatchDraft("notes", e.target.value);
                    }}
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
                </fieldset>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
