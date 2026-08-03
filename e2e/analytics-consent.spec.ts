import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const CONSENT_KEY = "orange-textile.analytics-consent";
const GTM_ID = "GTM-5FHDLXGV";
const BANNER_COPY =
  "We use basic cookieless measurement by default. Accepting enables analytics cookies for more complete traffic and conversion reporting. You can change your choice at any time through Privacy settings in the footer. Read our terms.";
const ALL_DENIED_UPDATE = [
  "consent",
  "update",
  {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  },
] as const;

type ConsoleFailure = { kind: "console" | "pageerror"; message: string };
type DataLayerSnapshotItem = unknown[] | Record<string, unknown>;

async function protectAnalyticsRequests(context: BrowserContext) {
  const gtmRequests: string[] = [];
  const prohibitedRequests: string[] = [];

  await context.route("**/*", async (route) => {
    const url = route.request().url();

    if (/googletagmanager\.com\/gtm\.js(?:\?|$)/.test(url)) {
      gtmRequests.push(url);
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "/* GTM intentionally stubbed by browser tests. */",
      });
      return;
    }

    if (
      /googletagmanager\.com\/gtag\/js(?:\?|$)/.test(url) ||
      /google-analytics\.com\//.test(url)
    ) {
      prohibitedRequests.push(url);
      await route.abort();
      return;
    }

    await route.continue();
  });

  return { gtmRequests, prohibitedRequests };
}

function captureRuntimeFailures(page: Page) {
  const failures: ConsoleFailure[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push({ kind: "console", message: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    failures.push({ kind: "pageerror", message: error.message });
  });
  return failures;
}

async function dataLayerSnapshot(page: Page) {
  return page.evaluate(() => {
    const rawItems: unknown[] = [];
    const dataLayer = window.dataLayer;
    for (let index = 0; index < (dataLayer?.length ?? 0); index += 1) {
      rawItems.push(dataLayer?.[index] as unknown);
    }

    return rawItems.flatMap<DataLayerSnapshotItem>((item) => {
      if (Array.isArray(item)) return [[...item]];
      if (Object.prototype.toString.call(item) === "[object Arguments]") {
        return [Array.from(item as ArrayLike<unknown>)];
      }
      if (typeof item === "object" && item !== null) {
        return [{ ...(item as Record<string, unknown>) }];
      }
      return [];
    });
  });
}

async function consentCommands(page: Page, action: "default" | "update") {
  const snapshot = await dataLayerSnapshot(page);
  return snapshot.filter(
    (item): item is unknown[] =>
      Array.isArray(item) && item[0] === "consent" && item[1] === action,
  );
}

async function pageViews(page: Page) {
  const snapshot = await dataLayerSnapshot(page);
  return snapshot.filter(
    (item): item is Record<string, unknown> =>
      !Array.isArray(item) && item.event === "orange_page_view",
  );
}

async function expectNoRuntimeFailures(failures: ConsoleFailure[]) {
  expect(failures, "console errors, page errors, or hydration errors").toEqual([]);
}

async function installNoReloadWitness(page: Page) {
  const marker = await page.evaluate(() => {
    const value = crypto.randomUUID();
    Reflect.set(window, "__orangeE2EDocumentMarker", value);
    return value;
  });
  let mainFrameNavigations = 0;
  const countMainFrameNavigation = (frame: ReturnType<Page["mainFrame"]>) => {
    if (frame === page.mainFrame()) mainFrameNavigations += 1;
  };
  page.on("framenavigated", countMainFrameNavigation);

  return async () => {
    const currentMarker = await page.evaluate(() =>
      Reflect.get(window, "__orangeE2EDocumentMarker"),
    );
    page.off("framenavigated", countMainFrameNavigation);
    expect(
      currentMarker,
      "the consent action must keep the current document",
    ).toBe(marker);
    expect(mainFrameNavigations, "the consent action must not navigate the main frame").toBe(0);
  };
}

async function expectNewAllDeniedUpdateAfter(page: Page, startIndex: number) {
  await expect
    .poll(async () => {
      const newItems = (await dataLayerSnapshot(page)).slice(startIndex);
      return newItems.some(
        (item) =>
          Array.isArray(item) &&
          item[0] === "consent" &&
          item[1] === "update" &&
          JSON.stringify(item) === JSON.stringify(ALL_DENIED_UPDATE),
      );
    })
    .toBe(true);

  const newItems = (await dataLayerSnapshot(page)).slice(startIndex);
  expect(newItems).toContainEqual([...ALL_DENIED_UPDATE]);
}

async function expectSafeAreaSupport(page: Page) {
  const banner = page.getByRole("region", { name: "Analytics privacy choices" });
  await expect(banner.locator(":scope > div")).toHaveClass(
    /pb-\[calc\(1\.25rem\+env\(safe-area-inset-bottom\)\)\]/,
  );
  expect(
    await page.evaluate(() =>
      Array.from(document.styleSheets).some((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules).some((rule) =>
            rule.cssText.includes("env(safe-area-inset-bottom)"),
          );
        } catch {
          return false;
        }
      }),
    ),
    "the rendered stylesheet must preserve the safe-area environment variable",
  ).toBe(true);
}

test("queues denied consent before GTM and loads one exact container without standalone GA", async ({
  context,
  page,
}) => {
  const requests = await protectAnalyticsRequests(context);
  const failures = captureRuntimeFailures(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Privacy & analytics" })).toBeVisible();

  const snapshot = await dataLayerSnapshot(page);
  const defaultIndex = snapshot.findIndex(
    (item) => Array.isArray(item) && item[0] === "consent" && item[1] === "default",
  );
  const gtmStartIndex = snapshot.findIndex(
    (item) => !Array.isArray(item) && item.event === "gtm.js" && "gtm.start" in item,
  );

  expect(defaultIndex).toBeGreaterThanOrEqual(0);
  expect(gtmStartIndex).toBeGreaterThan(defaultIndex);
  expect(snapshot[defaultIndex]).toEqual([
    "consent",
    "default",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
  expect(snapshot.slice(defaultIndex + 1, gtmStartIndex)).toEqual([
    ["set", "allow_ad_personalization_signals", false],
    ["set", "ads_data_redaction", true],
  ]);

  expect(requests.gtmRequests).toHaveLength(1);
  expect(new URL(requests.gtmRequests[0]).searchParams.get("id")).toBe(GTM_ID);
  expect(requests.prohibitedRequests).toEqual([]);
  expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(1);
  expect(await page.locator('script[src*="/gtag/js"]').count()).toBe(0);
  expect(
    snapshot.filter((item) => Array.isArray(item) && item[0] === "config"),
    "the application must not queue a standalone GA config",
  ).toEqual([]);
  await expectNoRuntimeFailures(failures);
});

test("shows the exact first-visit choices and Accept grants only analytics without a reload", async ({
  context,
  page,
}) => {
  await protectAnalyticsRequests(context);
  const failures = captureRuntimeFailures(page);
  await page.goto("/");

  const banner = page.getByRole("region", { name: "Analytics privacy choices" });
  await expect(banner.getByRole("heading", { name: "Privacy & analytics" })).toBeVisible();
  await expect(banner.getByText(BANNER_COPY)).toBeVisible();
  await expect(banner.getByRole("button", { name: "Accept analytics cookies" })).toHaveText(
    "Accept",
  );
  await expect(banner.getByRole("button", { name: "Decline analytics cookies" })).toHaveText(
    "Decline",
  );
  await expect(banner.getByRole("button")).toHaveCount(2);
  await expect(banner.getByRole("button", { name: /close/i })).toHaveCount(0);

  const assertSameDocument = await installNoReloadWitness(page);
  await banner.getByRole("button", { name: "Accept analytics cookies" }).click();
  await expect(banner).toBeHidden();

  expect(await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY)).toBe(
    '{"version":1,"analytics":"granted"}',
  );
  expect(await consentCommands(page, "update")).toContainEqual([
    "consent",
    "update",
    {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
  await assertSameDocument();

  await page.reload();
  await expect(banner).toBeHidden();
  const commandsAfterRefresh = await consentCommands(page, "update");
  expect(commandsAfterRefresh[0]).toEqual([
    "consent",
    "update",
    {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
  await expectNoRuntimeFailures(failures);
});

test("Decline keeps all consent denied and remains hidden after refresh", async ({ context, page }) => {
  await protectAnalyticsRequests(context);
  const failures = captureRuntimeFailures(page);
  await page.goto("/");

  const banner = page.getByRole("region", { name: "Analytics privacy choices" });
  const assertSameDocument = await installNoReloadWitness(page);
  await banner.getByRole("button", { name: "Decline analytics cookies" }).click();
  await expect(banner).toBeHidden();
  await assertSameDocument();
  expect(await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY)).toBe(
    '{"version":1,"analytics":"denied"}',
  );
  expect((await consentCommands(page, "update")).at(-1)).toEqual([
    "consent",
    "update",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);

  await page.reload();
  await expect(banner).toBeHidden();
  await expectNoRuntimeFailures(failures);
});

test("footer reopens choices with heading focus and saving restores exact button focus", async ({
  context,
  page,
}) => {
  await protectAnalyticsRequests(context);
  const failures = captureRuntimeFailures(page);
  await page.addInitScript((key) => {
    localStorage.setItem(key, '{"version":1,"analytics":"denied"}');
  }, CONSENT_KEY);
  await page.goto("/");

  const privacySettings = page.getByRole("button", { name: "Privacy settings", exact: true });
  await privacySettings.scrollIntoViewIfNeeded();
  await privacySettings.click();
  const heading = page.getByRole("heading", { name: "Privacy & analytics" });
  await expect(heading).toBeFocused();

  await page.getByRole("button", { name: "Accept analytics cookies" }).click();
  await expect(privacySettings).toBeFocused();
  await expectNoRuntimeFailures(failures);
});

test("same-origin tabs synchronize choices, removal, and invalid values fail closed", async ({
  context,
}) => {
  await protectAnalyticsRequests(context);
  const pageOne = await context.newPage();
  const pageTwo = await context.newPage();
  const pageOneFailures = captureRuntimeFailures(pageOne);
  const pageTwoFailures = captureRuntimeFailures(pageTwo);
  await Promise.all([pageOne.goto("/"), pageTwo.goto("/")]);

  await pageOne.getByRole("button", { name: "Accept analytics cookies" }).click();
  await expect(pageTwo.getByRole("region", { name: "Analytics privacy choices" })).toBeHidden();
  await expect
    .poll(async () => (await consentCommands(pageTwo, "update")).at(-1)?.[2])
    .toMatchObject({ analytics_storage: "granted" });

  const privacySettings = pageOne.getByRole("button", { name: "Privacy settings", exact: true });
  await privacySettings.scrollIntoViewIfNeeded();
  await privacySettings.click();
  await pageOne.getByRole("button", { name: "Decline analytics cookies" }).click();
  await expect
    .poll(async () => (await consentCommands(pageTwo, "update")).at(-1)?.[2])
    .toMatchObject({ analytics_storage: "denied" });

  const beforeRemovalIndex = (await dataLayerSnapshot(pageTwo)).length;
  await pageOne.evaluate((key) => localStorage.removeItem(key), CONSENT_KEY);
  await expect(pageTwo.getByRole("region", { name: "Analytics privacy choices" })).toBeVisible();
  await expectNewAllDeniedUpdateAfter(pageTwo, beforeRemovalIndex);
  await expect(
    pageTwo.getByText("We could not save your analytics choice in this browser."),
  ).toHaveCount(0);

  const beforeCorruptionIndex = (await dataLayerSnapshot(pageTwo)).length;
  await pageOne.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [CONSENT_KEY, '{"version":999,"analytics":"granted"}'],
  );
  await expectNewAllDeniedUpdateAfter(pageTwo, beforeCorruptionIndex);
  await expect(pageTwo.getByText("We could not save your analytics choice in this browser.")).toBeVisible();
  await expect(pageTwo.getByRole("region", { name: "Analytics privacy choices" })).toContainText(
    "We could not save your analytics choice in this browser.",
  );
  await expectNoRuntimeFailures(pageOneFailures);
  await expectNoRuntimeFailures(pageTwoFailures);
});

test("unavailable localStorage fails closed while keeping a usable banner and readable error", async ({
  context,
  page,
}) => {
  await protectAnalyticsRequests(context);
  await page.addInitScript((consentKey) => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.getItem = function (key) {
      if (key === consentKey) throw new DOMException("Storage blocked", "SecurityError");
      return originalGetItem.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === consentKey) throw new DOMException("Storage blocked", "SecurityError");
      return originalSetItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function (key) {
      if (key === consentKey) throw new DOMException("Storage blocked", "SecurityError");
      return originalRemoveItem.call(this, key);
    };
  }, CONSENT_KEY);
  const failures = captureRuntimeFailures(page);
  await page.goto("/");

  const banner = page.getByRole("region", { name: "Analytics privacy choices" });
  await expect(banner).toBeVisible();
  await expect(banner.getByText("Analytics cookies remain off; please try again.")).toBeVisible();
  await expect(banner).toContainText(
    "Analytics cookies remain off; please try again.",
  );
  expect((await consentCommands(page, "default"))[0]?.[2]).toMatchObject({
    analytics_storage: "denied",
  });

  await banner.getByRole("button", { name: "Accept analytics cookies" }).click();
  await expect(banner).toBeVisible();
  await expect(banner.getByText("Analytics cookies remain off; please try again.")).toBeVisible();
  expect((await consentCommands(page, "update")).at(-1)?.[2]).toMatchObject({
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  await expectNoRuntimeFailures(failures);
});

test("tracks each real allowed App Router navigation once and suppresses unknown routes and PII", async ({
  context,
  page,
}) => {
  await protectAnalyticsRequests(context);
  const failures = captureRuntimeFailures(page);
  await page.addInitScript((key) => {
    localStorage.setItem(key, '{"version":1,"analytics":"denied"}');
  }, CONSENT_KEY);
  await page.goto("/");
  await expect.poll(async () => (await pageViews(page)).length).toBe(1);

  await page.getByRole("contentinfo").getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(async () => (await pageViews(page)).length).toBe(2);

  await page.getByRole("contentinfo").getByRole("link", { name: "Finished fabrics" }).click();
  await expect(page).toHaveURL(/\/fabrics$/);
  await expect.poll(async () => (await pageViews(page)).length).toBe(3);

  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(async () => (await pageViews(page)).length).toBe(4);
  await page.goForward();
  await expect(page).toHaveURL(/\/fabrics$/);
  await expect.poll(async () => (await pageViews(page)).length).toBe(5);
  expect((await pageViews(page)).map((view) => view.page_path)).toEqual([
    "/",
    "/about",
    "/fabrics",
    "/about",
    "/fabrics",
  ]);

  const tracked = await pageViews(page);
  for (const event of tracked) {
    expect(Object.keys(event).sort()).toEqual(
      ["event", "page_location", "page_path"].sort(),
    );
    expect(JSON.stringify(event)).not.toMatch(/email|phone|form|buyer%40example\.com/i);
  }

  const beforeUnknown = await pageViews(page);
  await page.evaluate(() => window.history.pushState(null, "", "/blog/buyer%40example.com"));
  await expect(page).toHaveURL(/\/blog\/buyer%40example\.com$/);
  await page.waitForTimeout(100);
  expect(await pageViews(page)).toEqual(beforeUnknown);
  await expectNoRuntimeFailures(failures);
});

test("banner is full-width, bottom-fixed, overflow-safe, keyboard reachable, and visually captured", async ({
  context,
  page,
}, testInfo) => {
  await protectAnalyticsRequests(context);
  const failures = captureRuntimeFailures(page);
  await page.goto("/");

  const banner = page.getByRole("region", { name: "Analytics privacy choices" });
  const box = await banner.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs((box?.x ?? -1) - 0)).toBeLessThanOrEqual(1);
  expect(Math.abs((box?.width ?? -1) - testInfo.project.use.viewport!.width)).toBeLessThanOrEqual(1);
  expect(
    Math.abs((box?.y ?? 0) + (box?.height ?? 0) - testInfo.project.use.viewport!.height),
  ).toBeLessThanOrEqual(1);
  await expect(banner).toHaveCSS("position", "fixed");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );

  for (const name of ["Decline analytics cookies", "Accept analytics cookies"]) {
    const button = banner.getByRole("button", { name });
    await button.focus();
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeFocused();
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(48);
    expect(buttonBox?.y).toBeGreaterThanOrEqual(0);
    expect((buttonBox?.y ?? 9999) + (buttonBox?.height ?? 0)).toBeLessThanOrEqual(
      testInfo.project.use.viewport!.height + 1,
    );
  }

  const innerPaddingBottom = await banner.locator(":scope > div").evaluate(
    (element) => Number.parseFloat(getComputedStyle(element).paddingBottom),
  );
  expect(innerPaddingBottom).toBeGreaterThanOrEqual(20);
  await expectSafeAreaSupport(page);

  const screenshotName =
    testInfo.project.name === "mobile-320"
      ? "analytics-banner-320.png"
      : "analytics-banner-desktop.png";
  await page.screenshot({ path: `test-results/visual/${screenshotName}`, fullPage: false });
  await expectNoRuntimeFailures(failures);
});
