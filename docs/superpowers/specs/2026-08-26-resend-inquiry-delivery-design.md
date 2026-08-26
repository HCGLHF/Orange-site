# Resend Inquiry Delivery Hotfix Design

## Goal

Restore a complete production inquiry path without adding Notion or another database. Every website inquiry must be submitted to the Orange server, sent through Resend, and delivered to `folenchen0401@outlook.com`. The browser must show success only after Resend accepts the message.

## Scope

Included:

- Single-fabric and general inquiry forms.
- Batch inquiries from the selected-fabrics cart.
- Desktop and mobile `Request a Quote` entry points.
- Server-side validation, error handling, and Resend delivery.
- Removal of browser-direct Formspree submission and submitted-contact localStorage copies.
- Automated route, component, and buyer-journey tests.

Deferred:

- Notion, CRM, or database persistence.
- Buyer acknowledgement emails.
- Delivery webhooks and a staff dashboard.
- File attachments.

## Infrastructure Decisions

- Verified sending domain: `forms.orangetextiles.com`.
- Sender: `O'range Textile Website <inquiries@forms.orangetextiles.com>`.
- Recipient: `folenchen0401@outlook.com`.
- Resend key: `OrangeTextile`, Sending access, restricted to `forms.orangetextiles.com`.
- Secret storage: Vercel Production `RESEND_API_KEY`; never exposed to browser code or Git.

## Application Design

### Unified server endpoint

Both inquiry forms POST JSON to `POST /api/inquiry`. The endpoint accepts a normalized payload with:

- inquiry type: `single` or `batch`;
- customer name, email, optional company, phone, and notes;
- optional selected fabric information;
- a hidden honeypot field;
- a client-generated submission ID used as the Resend idempotency key.

The server rejects malformed JSON, missing required fields, invalid email addresses, oversized strings, empty batch selections, invalid content types, and populated honeypot fields. Error responses are generic and do not expose provider details.

After validation, the server sends a plain-text transactional email through Resend. The buyer email is set as `replyTo`, allowing staff to reply directly from Outlook. A response is successful only when Resend returns a message ID. Provider failures return an error and the form remains populated for retry.

### Form behavior

- The single/general form posts only to `/api/inquiry`; it no longer posts directly to Formspree.
- The batch form posts only to `/api/inquiry`; Notion and Formspree branching is removed from the active path.
- Submitted contact details are not written to localStorage.
- Analytics `generate_lead` fires only after the API reports success.
- Success UI is consistent and does not use `alert()`.

### Request a Quote behavior

Desktop and mobile `Request a Quote` controls become real client actions:

- with selected fabrics, open the batch inquiry modal;
- without selected fabrics, open the general inquiry modal.

The obsolete `/fabrics#inquiry-form` anchor is no longer the behavior contract for the CTA.

## Email Format

Subject:

`[Website inquiry] <company or customer> | <single fabric or N fabrics>`

Body sections:

1. submission ID and inquiry type;
2. customer contact details;
3. requested fabric names and quantities;
4. notes;
5. source URL and submission timestamp.

Plain text is used for the hotfix to avoid HTML injection and email-template dependencies.

## Testing

Tests are written before production changes and must demonstrate the original failures.

- API rejects invalid input and never calls Resend.
- API sends normalized single and batch messages with the correct recipient, sender, and reply-to address.
- API returns failure when Resend fails and does not report a lead.
- Repeated submission IDs use the same idempotency key.
- Single and batch components call `/api/inquiry`, preserve input after failure, and show success after acceptance.
- Desktop and mobile `Request a Quote` open the correct modal with zero and non-zero cart contents.
- Production browser verification submits one clearly labelled synthetic inquiry and confirms its Resend event.

## Rollout

1. Implement and run focused tests, full component tests, typecheck, and production build.
2. Deploy to production so the new Vercel secret is available.
3. Submit one synthetic production inquiry.
4. Confirm the Resend event and Outlook receipt.
5. Check production function logs for errors.

## Acceptance Criteria

- Every visible inquiry entry point opens a usable form.
- No browser code contains or accesses `RESEND_API_KEY`.
- No inquiry form sends directly to Formspree.
- A valid production submission is accepted by Resend and reaches `folenchen0401@outlook.com`.
- Failed delivery never produces a false success state.
- No submitted customer contact record is retained in localStorage.
