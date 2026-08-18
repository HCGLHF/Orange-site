import { expect, test } from "@playwright/test";

const heroCases = [
  {
    path: "/",
    mobile: "finished-double-knit-factory-mobile.avif",
    desktop: "finished-double-knit-factory.webp",
  },
  {
    path: "/about",
    mobile: "about-circular-knitting-floor-mobile.avif",
    desktop: "about-circular-knitting-floor.png",
  },
  {
    path: "/ready-stock-knit-fabrics",
    mobile: "double-knit-interlock-comparison-mobile.avif",
    desktop: "double-knit-interlock-comparison.webp",
  },
] as const;

for (const hero of heroCases) {
  test(`${hero.path} fetches exactly one viewport-specific Hero image`, async ({
    page,
  }, testInfo) => {
    const heroRequests: string[] = [];
    const isMobile = testInfo.project.name === "mobile-320";

    page.on("request", (request) => {
      const decodedUrl = decodeURIComponent(request.url());
      if (
        request.resourceType() === "image" &&
        (decodedUrl.includes(hero.mobile) || decodedUrl.includes(hero.desktop))
      ) {
        heroRequests.push(decodedUrl);
      }
    });

    await page.goto(hero.path, { waitUntil: "load" });
    const heroImage = page.locator("main picture img").first();
    await expect(heroImage).toBeVisible();
    await expect
      .poll(() =>
        heroImage.evaluate(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);

    expect(heroRequests).toHaveLength(1);
    expect(heroRequests[0]).toContain(isMobile ? hero.mobile : hero.desktop);
    expect(heroRequests[0]).not.toContain(isMobile ? hero.desktop : hero.mobile);
  });
}
