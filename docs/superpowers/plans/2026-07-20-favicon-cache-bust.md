# Favicon Cache-Bust Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Force browsers to request the approved branded orange favicon again without changing its visible artwork.

**Architecture:** Keep Next.js App Router file-based favicon discovery through `app/icon.svg`. Add one non-rendering version attribute so the file fingerprint changes, and protect that revision with the existing Node favicon regression test before deploying through the repository's Vercel Git integration.

**Tech Stack:** Next.js App Router, SVG, Node.js test runner, npm, GitHub, Vercel

---

### Task 1: Add a failing cache-bust regression assertion

**Files:**
- Modify: `tests/favicon.test.mjs`
- Test: `tests/favicon.test.mjs`

- [ ] **Step 1: Add the version-marker assertion**

Add this assertion after the existing `viewBox` assertion:

```js
assert.match(svg, /data-favicon-version="2026-07-20"/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/favicon.test.mjs
```

Expected: FAIL because the current root `<svg>` does not contain `data-favicon-version="2026-07-20"`.

### Task 2: Apply the non-visual SVG version marker

**Files:**
- Modify: `app/icon.svg:1`
- Test: `tests/favicon.test.mjs`

- [ ] **Step 1: Add the version attribute**

Replace the opening element with:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" data-favicon-version="2026-07-20">
```

Do not change any path, circle, ellipse, colour, coordinate, or dimension.

- [ ] **Step 2: Run the focused test and verify GREEN**

Run:

```bash
node --test tests/favicon.test.mjs
```

Expected: PASS, 1 test passed and 0 failed.

### Task 3: Verify the full project

**Files:**
- Verify: `package.json`
- Verify: entire project

- [ ] **Step 1: Run the complete test suite**

Run the test script defined in `package.json`:

```bash
npm test
```

Expected: exit code 0 with no failed tests.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: exit code 0 and a successful Next.js production build.

- [ ] **Step 3: Inspect the final diff**

```bash
git diff --check
git diff -- app/icon.svg tests/favicon.test.mjs
```

Expected: no whitespace errors; the diff contains only the test assertion and SVG version attribute.

### Task 4: Commit and publish

**Files:**
- Commit: `app/icon.svg`
- Commit: `tests/favicon.test.mjs`

- [ ] **Step 1: Commit only the implementation files**

```bash
git add app/icon.svg tests/favicon.test.mjs
git commit -m "fix: refresh branded favicon"
```

Do not stage the unrelated untracked domain-migration plan.

- [ ] **Step 2: Push `main`**

```bash
git push origin main
```

Expected: GitHub `main` advances to the favicon implementation commit.

### Task 5: Verify Vercel production

**Files:**
- Verify: Vercel project `alphax-advisory/orange-site`
- Verify: `https://orangetextiles.com/`

- [ ] **Step 1: Wait for the matching deployment**

Locate the deployment whose GitHub commit SHA matches the implementation commit. Expected target is `production` and final state is `READY`.

- [ ] **Step 2: Check build and runtime errors**

Inspect Vercel build logs with the errors-only filter and production runtime logs at `error` and `fatal` levels.

Expected: no build errors and no new error/fatal runtime logs.

- [ ] **Step 3: Verify the live favicon response**

Fetch `https://orangetextiles.com/`, extract the `<link rel="icon">` URL, then fetch that SVG.

Expected:

```text
homepage status: 200
favicon status: 200
content-type: image/svg+xml
favicon URL hash: different from 636e5a089117779b
SVG contains: data-favicon-version="2026-07-20"
SVG contains: #E07A5F and #5C9E6E
```

- [ ] **Step 4: Confirm domain behavior remains intact**

Fetch `https://www.orangetextiles.com/` without following redirects.

Expected: HTTP 301 with `Location: https://orangetextiles.com/`.
