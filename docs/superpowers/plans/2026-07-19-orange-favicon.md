# O'range Textile Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default browser-tab favicon with the existing O'range Textile orange mark and publish the verified change through the repository's Vercel deployment flow.

**Architecture:** Next.js App Router will discover a single file-based icon at `app/icon.svg`. A focused Node test will lock the brand geometry and colors while ensuring the old `app/favicon.ico` cannot take precedence.

**Tech Stack:** Next.js 14 App Router, SVG, Node.js built-in test runner, Git, GitHub, Vercel Git integration

---

## File Structure

- Create `tests/favicon.test.mjs`: verifies icon discovery, removal of the default ICO, and the approved orange-mark SVG details.
- Create `app/icon.svg`: the canonical favicon, matching `components/OrangeMark.tsx`.
- Delete `app/favicon.ico`: removes the default Next.js/Vercel icon that can take precedence or remain cached.

### Task 1: Add the favicon regression test

**Files:**
- Create: `tests/favicon.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = path.join(root, "app", "icon.svg");
const legacyIconPath = path.join(root, "app", "favicon.ico");

test("the app exposes the O'range Textile mark as its only favicon", () => {
  assert.ok(existsSync(svgPath), "app/icon.svg must exist");
  assert.equal(existsSync(legacyIconPath), false, "app/favicon.ico must be removed");

  const svg = readFileSync(svgPath, "utf8");
  assert.match(svg, /viewBox="0 0 32 32"/);
  assert.match(svg, /fill="#E07A5F"/);
  assert.match(svg, /fill="#5C9E6E"/);
  assert.match(svg, /<circle cx="16" cy="19" r="11"/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/favicon.test.mjs`

Expected: FAIL with `app/icon.svg must exist` because the branded icon has not been added yet.

### Task 2: Install the branded SVG favicon

**Files:**
- Create: `app/icon.svg`
- Delete: `app/favicon.ico`

- [ ] **Step 1: Add the exact OrangeMark artwork as file-based metadata**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path d="M16 3.5c-.8 1.6-2.4 3.8-1.8 5.8 1.4-.6 2.8-2.8 1.8-5.8z" fill="#5C9E6E"/>
  <path d="M16 7.5v1.2" stroke="#4A7C59" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="16" cy="19" r="11" fill="#E07A5F"/>
  <ellipse cx="11.5" cy="15.5" rx="4" ry="2.8" fill="#F4B5A0" opacity=".55"/>
  <path d="M10 24c2.2 1.8 5.5 2 9.5.5" stroke="#C96B52" stroke-width="1" stroke-linecap="round" opacity=".5"/>
</svg>
```

- [ ] **Step 2: Remove the old icon**

Delete `app/favicon.ico` so Next.js emits only the approved SVG favicon.

- [ ] **Step 3: Run the focused test and verify GREEN**

Run: `node --test tests/favicon.test.mjs`

Expected: PASS, 1 test and 0 failures.

### Task 3: Verify the complete application

**Files:**
- Verify: `app/icon.svg`
- Verify: `tests/favicon.test.mjs`

- [ ] **Step 1: Run all automated tests**

Run: `npm.cmd test`

Expected: PASS, including the new favicon test, with 0 failures.

- [ ] **Step 2: Run the production build**

Run: `npm.cmd run build`

Expected: exit code 0; Next.js completes the production build and accepts `app/icon.svg` as metadata.

- [ ] **Step 3: Review the final diff**

Run: `git diff --check` and `git status -sb`

Expected: no whitespace errors; only the plan, favicon test, new SVG, and deletion of the old ICO are included.

### Task 4: Commit and publish

**Files:**
- Stage: `docs/superpowers/plans/2026-07-19-orange-favicon.md`
- Stage: `tests/favicon.test.mjs`
- Stage: `app/icon.svg`
- Stage deletion: `app/favicon.ico`

- [ ] **Step 1: Commit the verified implementation**

```bash
git add docs/superpowers/plans/2026-07-19-orange-favicon.md tests/favicon.test.mjs app/icon.svg app/favicon.ico
git commit -m "feat: add branded favicon"
```

Expected: one implementation commit containing only the planned files.

- [ ] **Step 2: Push production branch**

Run: `git push origin main`

Expected: `origin/main` advances to the favicon implementation commit and Vercel begins its configured production deployment.

- [ ] **Step 3: Verify the deployed favicon after Vercel completes**

Open the production deployment and confirm its page metadata references `/icon.svg` and that `/icon.svg` returns the orange-mark artwork. Because browsers cache favicons aggressively, reload with cache disabled or open a private window before judging the tab icon.
