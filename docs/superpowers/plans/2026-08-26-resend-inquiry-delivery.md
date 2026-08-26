# Resend Inquiry Delivery Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route every Orange website inquiry through a validated server endpoint that sends a Resend email to `folenchen0401@outlook.com`, while making every Request a Quote CTA open a usable form.

**Architecture:** Browser forms submit one normalized JSON contract to `POST /api/inquiry`. The route validates the request and delegates message formatting and Resend delivery to a focused `lib/inquiry-email.ts` module; success is returned only with a Resend message ID. A shared client `RequestQuoteButton` chooses the batch modal when the cart has items and the general modal otherwise.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Resend Node SDK, Vitest, Testing Library, Node test runner, Playwright browser verification, Vercel.

---

## File Structure

- Create `lib/inquiry-email.ts`: normalized inquiry types, plain-text email rendering, Resend transport, constants, and idempotency handling.
- Rewrite `app/api/inquiry/route.ts`: content-type guard, parsing, validation, honeypot handling, and transport invocation; no Notion logic.
- Modify `components/ui/InquiryModal.tsx`: submit a single/general inquiry to `/api/inquiry` and use inline success/error UI.
- Modify `components/InquiryBar.tsx`: submit one batch payload to `/api/inquiry`; remove Formspree and Notion branching.
- Create `components/RequestQuoteButton.tsx`: choose general or batch modal from current cart state.
- Modify `components/ui/Navbar.tsx` and `components/ui/MobileNavigationDrawer.tsx`: replace quote links with `RequestQuoteButton` actions.
- Modify `lib/inquiry-storage.ts` and `lib/legal-content.ts`: remove submitted-contact localStorage/Formspree behavior and stale disclosure.
- Create `tests/inquiry-email.test.ts`, `tests/inquiry-api.test.ts`, and `tests/RequestQuoteButton.test.tsx`.
- Modify `tests/analytics/InquiryModalAnalytics.test.tsx`, `tests/analytics/InquiryBarAnalytics.test.tsx`, `tests/navigation.test.mjs`, and `e2e/analytics-consent.spec.ts`.
- Modify `package.json` and `package-lock.json`: add the Resend SDK.

### Task 1: Add the Resend transport boundary

**Files:**
- Create: `tests/inquiry-email.test.ts`
- Create: `lib/inquiry-email.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the server-only Resend SDK**

Run: `npm install resend`

Expected: `resend` appears in `dependencies`; the lockfile updates without unrelated package removals.

- [ ] **Step 2: Write the failing transport tests**

Create `tests/inquiry-email.test.ts` with tests that import `renderInquiryEmail` and `sendInquiryEmail`, assert the fixed sender/recipient, assert buyer `replyTo`, and assert the supplied submission ID is sent as an idempotency header. Use this complete fake sender shape:

```ts
const send = vi.fn().mockResolvedValue({
  data: { id: "email_123" },
  error: null,
});
const sender = { emails: { send } };

const input = {
  type: "single" as const,
  submissionId: "inq_1234567890abcdef",
  customer: "Buyer Name",
  email: "buyer@example.com",
  company: "Buyer Co",
  phone: "+86 13800000000",
  notes: "Need lab dips",
  sourceUrl: "https://orangetextiles.com/fabrics",
  items: [{ name: "Cotton Jersey", quantity: "500 m" }],
};

expect(await sendInquiryEmail(input, sender)).toEqual({ id: "email_123" });
expect(send).toHaveBeenCalledWith(
  expect.objectContaining({
    from: "O'range Textile Website <inquiries@forms.orangetextiles.com>",
    to: ["folenchen0401@outlook.com"],
    replyTo: "buyer@example.com",
  }),
  { headers: { "Idempotency-Key": "inquiry-inq_1234567890abcdef" } },
);
```

Also test `{ data: null, error: { message: "rejected" } }` rejects with `Inquiry delivery failed.` and that the formatted body includes contact details, every fabric line, source URL, and submission ID.

- [ ] **Step 3: Run the transport test and verify RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/inquiry-email.test.ts`

Expected: FAIL because `@/lib/inquiry-email` does not exist.

- [ ] **Step 4: Implement the minimal transport**

Create `lib/inquiry-email.ts` with these exported contracts and behavior:

```ts
import { Resend } from "resend";

export const INQUIRY_FROM =
  "O'range Textile Website <inquiries@forms.orangetextiles.com>";
export const INQUIRY_TO = "folenchen0401@outlook.com";

export type InquiryItem = {
  name: string;
  quantity?: string;
  composition?: string;
  weight?: string;
  stockStatus?: string;
};

export type InquiryEmailInput = {
  type: "single" | "batch";
  submissionId: string;
  customer: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  sourceUrl?: string;
  items: InquiryItem[];
};

type Sender = {
  emails: {
    send: (
      message: Record<string, unknown>,
      options: { headers: Record<string, string> },
    ) => Promise<{ data: { id: string } | null; error: unknown }>;
  };
};

export function renderInquiryEmail(input: InquiryEmailInput) {
  const subjectTarget = input.company?.trim() || input.customer;
  const itemSummary =
    input.type === "batch" ? `${input.items.length} fabrics` : input.items[0]?.name || "General request";
  const lines = input.items.map((item, index) =>
    [
      `${index + 1}. ${item.name}`,
      item.quantity,
      item.composition,
      item.weight,
      item.stockStatus,
    ].filter(Boolean).join(" | "),
  );
  return {
    subject: `[Website inquiry] ${subjectTarget} | ${itemSummary}`,
    text: [
      `Submission ID: ${input.submissionId}`,
      `Inquiry type: ${input.type}`,
      `Customer: ${input.customer}`,
      `Company: ${input.company?.trim() || "Not provided"}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone?.trim() || "Not provided"}`,
      "",
      "Requested fabrics:",
      ...(lines.length ? lines : ["General sourcing request"]),
      "",
      `Notes: ${input.notes?.trim() || "None"}`,
      `Source: ${input.sourceUrl?.trim() || "Not provided"}`,
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n"),
  };
}

export async function sendInquiryEmail(
  input: InquiryEmailInput,
  sender: Sender = new Resend(process.env.RESEND_API_KEY) as unknown as Sender,
) {
  if (!process.env.RESEND_API_KEY && arguments.length < 2) {
    throw new Error("Inquiry delivery is not configured.");
  }
  const rendered = renderInquiryEmail(input);
  const { data, error } = await sender.emails.send(
    {
      from: INQUIRY_FROM,
      to: [INQUIRY_TO],
      replyTo: input.email,
      subject: rendered.subject,
      text: rendered.text,
    },
    { headers: { "Idempotency-Key": `inquiry-${input.submissionId}` } },
  );
  if (error || !data?.id) throw new Error("Inquiry delivery failed.");
  return { id: data.id };
}
```

- [ ] **Step 5: Run the transport tests and verify GREEN**

Run: `.\node_modules\.bin\vitest.cmd run tests/inquiry-email.test.ts`

Expected: all transport tests PASS.

- [ ] **Step 6: Commit the transport boundary**

```bash
git add package.json package-lock.json lib/inquiry-email.ts tests/inquiry-email.test.ts
git commit -m "feat: add resend inquiry transport"
```

### Task 2: Replace the Notion-skipping API with validated Resend delivery

**Files:**
- Create: `tests/inquiry-api.test.ts`
- Modify: `app/api/inquiry/route.ts`

- [ ] **Step 1: Write failing API tests**

Mock `@/lib/inquiry-email` and call `POST(new Request(...))`. Cover:

```ts
vi.mock("@/lib/inquiry-email", () => ({
  sendInquiryEmail: vi.fn(),
}));

const validBody = {
  type: "single",
  submissionId: "inq_1234567890abcdef",
  customer: "Buyer Name",
  email: "buyer@example.com",
  company: "Buyer Co",
  phone: "+86 13800000000",
  notes: "Need lab dips",
  sourceUrl: "https://orangetextiles.com/fabrics",
  honeypot: "",
  items: [{ name: "Cotton Jersey", quantity: "500 m" }],
};
```

Assert: non-JSON content type returns 415; malformed JSON returns 400; bad email, missing name, short submission ID, strings over their limits, populated honeypot, and empty batch items return 400 without calling the sender; a valid request calls `sendInquiryEmail(validBody)` and returns `{ success: true, inquiryId: "email_123" }`; transport failure returns status 502 with only `Submission failed. Please try again or email us directly.`.

- [ ] **Step 2: Run API tests and verify RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/inquiry-api.test.ts`

Expected: FAIL because the existing route returns `{ skipped: true }` before parsing when Notion is absent.

- [ ] **Step 3: Implement strict parsing and Resend invocation**

Rewrite `app/api/inquiry/route.ts` to import `sendInquiryEmail`, validate with small local helpers, and cap fields as follows: name 120, email 254, company 160, phone 60, notes 4000, source URL 500, item name 240, item metadata 240, at most 50 items. Require `Content-Type: application/json`, `type`, `submissionId` matching `^[A-Za-z0-9_-]{16,100}$`, name, valid email, and at least one item for `batch`. Treat a non-empty honeypot as a generic 400. Call `sendInquiryEmail(normalized)` and return the Resend ID. Log only the submission ID and error class, never request PII.

- [ ] **Step 4: Run API tests and verify GREEN**

Run: `.\node_modules\.bin\vitest.cmd run tests/inquiry-api.test.ts`

Expected: all API tests PASS.

- [ ] **Step 5: Commit the API replacement**

```bash
git add app/api/inquiry/route.ts tests/inquiry-api.test.ts
git commit -m "feat: deliver inquiries through resend api"
```

### Task 3: Move the single/general form to the server endpoint

**Files:**
- Modify: `tests/analytics/InquiryModalAnalytics.test.tsx`
- Modify: `components/ui/InquiryModal.tsx`

- [ ] **Step 1: Rewrite the single-form expectations before production code**

Change the success mock to return `{ success: true, inquiryId: "email_123" }`; assert exactly one fetch to `/api/inquiry` with JSON headers and a body containing `type: "single"`, a 16+ character submission ID, buyer fields, source URL, empty honeypot, and the selected fabric/quantity. Assert success renders inline `Submitted successfully` rather than calling `window.alert`. Assert non-OK and network failures leave the dialog open with the existing localized error and emit no lead.

- [ ] **Step 2: Run the single-form test and verify RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/analytics/InquiryModalAnalytics.test.tsx`

Expected: FAIL because the component posts directly to Formspree, alerts, and closes.

- [ ] **Step 3: Implement the single-form payload and inline state**

In `InquiryModal.tsx`, remove `appendInquiryRecord` and `FORMSPREE_INQUIRY_ENDPOINT`; build `submissionId` with `crypto.randomUUID()` and strip hyphens only if necessary; POST to `/api/inquiry`; parse `{ success, error }`; render existing success state in the modal; preserve form values on failure; call `pushGenerateLead("single_inquiry")` only after success. Add an off-screen honeypot input named `website` with `autoComplete="off"` and `tabIndex={-1}` and send its value as `honeypot`.

- [ ] **Step 4: Run the single-form test and verify GREEN**

Run: `.\node_modules\.bin\vitest.cmd run tests/analytics/InquiryModalAnalytics.test.tsx`

Expected: all single-form tests PASS and no alert spy is needed.

- [ ] **Step 5: Commit the single form**

```bash
git add components/ui/InquiryModal.tsx tests/analytics/InquiryModalAnalytics.test.tsx
git commit -m "fix: send single inquiries through server"
```

### Task 4: Move the batch form to the same endpoint

**Files:**
- Modify: `tests/analytics/InquiryBarAnalytics.test.tsx`
- Modify: `components/InquiryBar.tsx`

- [ ] **Step 1: Rewrite batch expectations before production code**

Replace two-fetch and skipped-fallback tests with one-fetch tests. Assert one request to `/api/inquiry`, `type: "batch"`, a stable submission ID per retry, buyer details, and normalized item strings. Keep tests proving analytics fires once only after success and that failed/network responses preserve the form and emit no lead.

- [ ] **Step 2: Run the batch test and verify RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/analytics/InquiryBarAnalytics.test.tsx`

Expected: FAIL because the component still branches to Formspree and Notion semantics.

- [ ] **Step 3: Implement one server submission**

Remove Formspree imports and bodies. POST one payload containing `type: "batch"`, customer fields, source URL, honeypot, and items with quantity such as `${i.quantity} m`, composition, `${i.weight} g`, and stock status. Keep the current success/reset/clear-cart timing; on failure do not reset or clear. Generate the submission ID when the modal opens so a user retry is idempotent.

- [ ] **Step 4: Run the batch test and verify GREEN**

Run: `.\node_modules\.bin\vitest.cmd run tests/analytics/InquiryBarAnalytics.test.tsx`

Expected: all batch tests PASS with exactly one fetch per submission.

- [ ] **Step 5: Commit the batch form**

```bash
git add components/InquiryBar.tsx tests/analytics/InquiryBarAnalytics.test.tsx
git commit -m "fix: send batch inquiries through server"
```

### Task 5: Make every Request a Quote CTA open a form

**Files:**
- Create: `tests/RequestQuoteButton.test.tsx`
- Create: `components/RequestQuoteButton.tsx`
- Modify: `components/ui/Navbar.tsx`
- Modify: `components/ui/MobileNavigationDrawer.tsx`
- Modify: `tests/navigation.test.mjs`

- [ ] **Step 1: Write failing button behavior tests**

Mock `useInquiry`, `useInquiryCart`, and `dispatchOpenBatchInquiry`. Assert zero cart items calls `openInquiry()`; one item calls `dispatchOpenBatchInquiry()`; `onBeforeOpen` closes the mobile drawer before either action; and the component renders a semantic button with supplied class and children.

- [ ] **Step 2: Run the CTA tests and verify RED**

Run: `.\node_modules\.bin\vitest.cmd run tests/RequestQuoteButton.test.tsx`

Expected: FAIL because `RequestQuoteButton` does not exist.

- [ ] **Step 3: Implement the shared action**

Create:

```tsx
"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useInquiry } from "@/components/InquiryProvider";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { dispatchOpenBatchInquiry } from "@/lib/inquiry-events";

type Props = Pick<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "aria-label"> & {
  children: ReactNode;
  onBeforeOpen?: () => void;
};

export function RequestQuoteButton({ children, onBeforeOpen, ...buttonProps }: Props) {
  const { openInquiry } = useInquiry();
  const { totalCount } = useInquiryCart();
  return (
    <button
      type="button"
      {...buttonProps}
      onClick={() => {
        onBeforeOpen?.();
        if (totalCount > 0) dispatchOpenBatchInquiry();
        else openInquiry();
      }}
    >
      {children}
    </button>
  );
}
```

Replace the desktop/mobile quote `Link` controls with this button. Keep the cart icon link as navigation to `/fabrics#inquiry-form`. Update navigation source-contract tests to assert `RequestQuoteButton` rather than quote CTA `href` usage.

- [ ] **Step 4: Run CTA and navigation tests and verify GREEN**

Run: `.\node_modules\.bin\vitest.cmd run tests/RequestQuoteButton.test.tsx`

Run: `node --test tests/navigation.test.mjs`

Expected: both suites PASS.

- [ ] **Step 5: Commit the CTA repair**

```bash
git add components/RequestQuoteButton.tsx components/ui/Navbar.tsx components/ui/MobileNavigationDrawer.tsx tests/RequestQuoteButton.test.tsx tests/navigation.test.mjs
git commit -m "fix: open inquiry forms from quote ctas"
```

### Task 6: Remove stale browser storage and Formspree claims

**Files:**
- Modify: `lib/inquiry-storage.ts`
- Modify: `lib/legal-content.ts`
- Modify: `tests/legal-pages.test.mjs`
- Modify: `e2e/analytics-consent.spec.ts`

- [ ] **Step 1: Write failing source and legal-contract assertions**

Assert no active inquiry component imports `FORMSPREE_INQUIRY_ENDPOINT` or `appendInquiryRecord`; legal content states inquiry details are sent to the business email workflow and are not retained in browser storage; the browser test intercepts `/api/inquiry` instead of Formspree.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/legal-pages.test.mjs`

Expected: FAIL on the old localStorage/Formspree wording.

- [ ] **Step 3: Remove obsolete behavior and update disclosure**

Delete `FORMSPREE_INQUIRY_ENDPOINT`, `appendInquiryRecord`, and inquiry-record types if no callers remain; retain only code still imported elsewhere, or delete `lib/inquiry-storage.ts` if empty. Replace the privacy sentence with: `Inquiry details are sent to O'range Textile's business email workflow and are not retained in browser storage after submission.` Update the E2E route mock to `**/api/inquiry` returning `{ success: true, inquiryId: "email_test" }`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test tests/legal-pages.test.mjs`

Run: `.\node_modules\.bin\vitest.cmd run tests/analytics/InquiryModalAnalytics.test.tsx tests/analytics/InquiryBarAnalytics.test.tsx`

Expected: all suites PASS.

- [ ] **Step 5: Commit cleanup**

```bash
git add lib/inquiry-storage.ts lib/legal-content.ts tests/legal-pages.test.mjs e2e/analytics-consent.spec.ts
git commit -m "chore: remove legacy inquiry browser storage"
```

### Task 7: Full verification, production deployment, and real delivery check

**Files:**
- Modify only if verification exposes a defect; add a failing regression test before each fix.

- [ ] **Step 1: Run all automated gates**

Run in order:

```powershell
npm test
npm run test:components
npm run typecheck
npm run build
```

Expected: every command exits 0; no secret appears in output or generated client chunks.

- [ ] **Step 2: Audit the final diff and secret exposure**

Run:

```powershell
git diff --check 69d9b6c..HEAD
rg -n "re_[A-Za-z0-9_-]{10,}|RESEND_API_KEY\s*=" app components lib tests e2e
rg -n "formspree\.io|FORMSPREE_INQUIRY_ENDPOINT|appendInquiryRecord" components app
git status --short
```

Expected: no key value, no browser Formspree submission, no whitespace errors, and only intended/user-preexisting working-tree changes remain.

- [ ] **Step 3: Deploy production**

Run: `.\node_modules\.bin\vercel.cmd deploy --prod --yes`

Expected: deployment reaches `READY` and the production alias remains `https://orangetextiles.com`.

- [ ] **Step 4: Verify the complete buyer journey**

Using a fresh browser session:

1. Click desktop Request a Quote with an empty cart and confirm the general modal opens.
2. Submit the clearly labelled synthetic inquiry `Orange production delivery verification` using an authorized test sender address.
3. Confirm inline success only after `/api/inquiry` returns 200.
4. Add one fabric, click Request a Quote, and confirm the batch modal opens without submitting a second real inquiry.
5. Check mobile Request a Quote behavior at a mobile viewport.

Expected: all CTA paths open the correct modal and the one synthetic request succeeds.

- [ ] **Step 5: Confirm delivery and production health**

In Resend, confirm the synthetic message has a Resend message ID and reaches `delivered`; ask the user to confirm Outlook receipt. Run Vercel production log inspection for the deployment and confirm no inquiry function errors. If delivery is delayed or bounced, report the actual event and do not claim completion.

- [ ] **Step 6: Confirm repository handoff state**

Run: `git status --short`

Expected: the Resend implementation files are committed. The pre-existing `components/ContactCard.tsx`, `lib/geo-content.ts`, `docs/superpowers/plans/*`, `output/`, and `tmp/` changes remain untouched unless separately authorized. Do not create an empty commit when verification required no fixes.
