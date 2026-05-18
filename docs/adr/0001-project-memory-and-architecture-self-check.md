# ADR 0001: Project Memory And Architecture Self-Check

## Status

Accepted

## Date

2026-05-18

## Context

This project needs stable engineering memory, clear architecture boundaries, risk awareness, and reliable next-step judgment across human and AI-assisted development. Earlier work created implementation plans, but the repository did not yet have required root-level memory documents or ADRs.

## Decision

All future development must begin by reading:

- `CONTEXT.md`
- `docs/architecture.md`
- `docs/risks.md`
- `docs/next.md`
- existing ADRs in `docs/adr/`

If any required memory file is missing, create a minimal version before starting development.

Before modifying code, the developer or AI assistant must answer:

- Which project goal does this change serve?
- Which module boundaries does this affect?
- Does it violate any existing ADR?
- Is there a smaller, safer implementation?
- Does the change require a new ADR?

Every task must end by updating `docs/next.md` with:

- `Done`: what was completed.
- `Learned`: new facts, constraints, or opportunities discovered.
- `Risks`: current architecture, product, or engineering risks.
- `Next`: the 1 to 3 highest-value next tasks.

When choosing next work, use:

`Priority = user value + risk reduction + unlocked future capability - implementation cost - uncertainty`

## Alternatives Considered

- Keep project memory only in chat history. Rejected because it is not durable, searchable, or shared across sessions.
- Use only implementation plans under `docs/superpowers/`. Rejected because plans describe tasks, not durable architecture boundaries or risk posture.
- Add a large governance process. Rejected because this project needs lightweight memory, not ceremony-heavy process.

## Consequences

- Future tasks have a small upfront reading and self-check cost.
- Architecture drift should become easier to notice before it enters the main path.
- Durable decisions will be visible in the repository instead of being hidden in conversation.
- `docs/next.md` becomes the shared handoff point for recent progress, risks, and next-step prioritization.
