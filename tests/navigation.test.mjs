import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const navigationUrl = new URL("../lib/navigation.ts", import.meta.url);
const desktopNavigationUrl = new URL(
  "../components/ui/DesktopNavigation.tsx",
  import.meta.url
);

const loadNavigation = async () => {
  assert.ok(existsSync(navigationUrl), "lib/navigation.ts must exist");
  return import(navigationUrl.href);
};

test("buyer-journey navigation exposes the approved groups and order", async () => {
  const { PRIMARY_NAVIGATION } = await loadNavigation();

  assert.deepEqual(
    PRIMARY_NAVIGATION.map((section) =>
      section.kind === "group"
        ? {
            kind: section.kind,
            id: section.id,
            label: section.label,
            items: section.items.map((item) => [item.label, item.href]),
          }
        : {
            kind: section.kind,
            id: section.id,
            label: section.label,
            href: section.href,
          }
    ),
    [
      {
        kind: "group",
        id: "products",
        label: "Products",
        items: [
          ["Ready Stock", "/ready-stock-knit-fabrics"],
          ["Finished Knit Fabrics", "/fabrics"],
          ["Double-Knit Manufacturing", "/finished-double-knit-fabrics"],
          ["Interlock Fabric", "/fabrics/interlock-fabric"],
          ["Ponte Roma Fabric", "/fabrics/ponte-roma-fabric"],
          ["Rib Knit Fabric", "/fabrics/rib-knit-fabric"],
          ["View All Fabrics", "/fabrics"],
        ],
      },
      {
        kind: "link",
        id: "custom-development",
        label: "Custom Development",
        href: "/custom-knit-fabric-development",
      },
      {
        kind: "group",
        id: "resources",
        label: "Resources",
        items: [
          [
            "What Is Double Knit Fabric?",
            "/blog/what-is-double-knit-fabric",
          ],
          ["What Is Interlock Fabric?", "/blog/what-is-interlock-fabric"],
          ["What Is Ponte Fabric?", "/blog/what-is-ponte-fabric"],
          ["View All Buyer Guides", "/blog"],
        ],
      },
      {
        kind: "link",
        id: "about",
        label: "About",
        href: "/about",
      },
    ]
  );
});

test("every navigation destination resolves to a registered public page", async () => {
  const { INQUIRY_HREF, NAVIGATION_DISCOVERY_HREFS } = await loadNavigation();
  const { getAllPublicPageSeo } = await import("../lib/seo/site-seo.ts");
  const publicPages = getAllPublicPageSeo();
  const publicPaths = new Set(publicPages.map((page) => page.path));

  assert.equal(INQUIRY_HREF, "/fabrics#inquiry-form");
  assert.ok(NAVIGATION_DISCOVERY_HREFS.includes(INQUIRY_HREF));
  assert.equal(
    new Set(NAVIGATION_DISCOVERY_HREFS).size,
    NAVIGATION_DISCOVERY_HREFS.length
  );
  assert.ok(Object.isFrozen(NAVIGATION_DISCOVERY_HREFS));
  assert.equal(publicPages.length, 29);
  assert.equal(publicPaths.size, publicPages.length);

  for (const href of NAVIGATION_DISCOVERY_HREFS) {
    const pathname = href.split("#")[0];
    assert.ok(publicPaths.has(pathname), `${href} must resolve publicly`);
  }
});

test("only the documented catalogue destination is duplicated", async () => {
  const { PRIMARY_NAVIGATION } = await loadNavigation();
  const hrefs = PRIMARY_NAVIGATION.flatMap((section) =>
    section.kind === "group"
      ? section.items.map((item) => item.href)
      : [section.href]
  );
  const duplicates = [
    ...new Set(
      hrefs.filter((href, index) => hrefs.indexOf(href) !== index)
    ),
  ];

  assert.deepEqual(duplicates, ["/fabrics"]);
  assert.equal(
    hrefs.filter((href) => href === "/fabrics").length,
    2
  );
});

test("active navigation follows the approved route families", async () => {
  const { getActiveNavigationId } = await loadNavigation();

  assert.equal(getActiveNavigationId("/"), "home");
  assert.equal(getActiveNavigationId("/fabrics"), "products");
  assert.equal(
    getActiveNavigationId("/fabrics/interlock-fabric"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/ready-stock-knit-fabrics"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/finished-double-knit-fabrics"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/custom-knit-fabric-development"),
    "custom-development"
  );
  assert.equal(getActiveNavigationId("/blog"), "resources");
  assert.equal(
    getActiveNavigationId("/blog/what-is-double-knit-fabric"),
    "resources"
  );
  assert.equal(getActiveNavigationId("/about"), "about");
  assert.equal(getActiveNavigationId("/unknown"), null);
});

test("desktop navigation implements the shared accessible menu contract", async () => {
  assert.ok(
    existsSync(desktopNavigationUrl),
    "components/ui/DesktopNavigation.tsx must exist"
  );

  const [source, { PRIMARY_NAVIGATION }] = await Promise.all([
    readFile(desktopNavigationUrl, "utf8"),
    loadNavigation(),
  ]);

  assert.match(source, /["']use client["']/);
  assert.match(source, /PRIMARY_NAVIGATION\.map\s*\(/);
  assert.match(source, /getActiveNavigationId\s*\(\s*pathname\s*\)/);
  assert.doesNotMatch(source, /const\s+navItems\s*=/);
  assert.match(source, /useState<NavigationGroupId\s*\|\s*null>/);
  assert.match(
    source,
    /current\s*===\s*section\.id\s*\?\s*null\s*:\s*section\.id/
  );

  assert.match(source, /aria-haspopup=["']menu["']/);
  assert.match(source, /aria-expanded=\{/);
  assert.match(source, /aria-controls=\{/);
  assert.match(source, /aria-current=\{/);
  assert.match(source, /role=["']menu["']/);
  assert.match(source, /role=["']menuitem["']/);
  assert.match(source, /aria-hidden=\{!isOpen\}/);
  assert.match(source, /tabIndex=\{isOpen\s*\?\s*0\s*:\s*-1\}/);
  assert.match(source, /invisible pointer-events-none/);

  assert.match(source, /\.items\.map\s*\(/);
  assert.match(source, /\{\s*item\.label\s*\}/);
  assert.match(source, /href=\{\s*item\.href\s*\}/);
  for (const section of PRIMARY_NAVIGATION) {
    if (section.kind !== "group") continue;
    for (const item of section.items) {
      assert.doesNotMatch(
        source,
        new RegExp(
          item.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        ),
        `${item.href} must come from PRIMARY_NAVIGATION`
      );
      assert.doesNotMatch(
        source,
        new RegExp(
          item.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        ),
        `${item.label} must come from PRIMARY_NAVIGATION`
      );
    }
  }

  assert.match(source, /event\.key\s*===\s*["']Escape["']/);
  assert.match(source, /triggerRefs\.current\[openGroup\]/);
  assert.match(source, /trigger\?\.focus\s*\(\s*\)/);
  assert.match(source, /["']pointerdown["']/);
  assert.match(source, /["']focusin["']/);
  assert.match(source, /addEventListener/);
  assert.match(source, /contains\s*\(\s*event\.target/);
  assert.match(source, /onClick=\{\(\)\s*=>\s*setOpenGroup\(null\)\}/);

  assert.match(
    source,
    /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*setOpenGroup\s*\(\s*null\s*\)\s*;\s*\}\s*,\s*\[\s*pathname\s*\]\s*\)/
  );
  assert.match(source, /hidden[^"']*xl:flex/);
  assert.match(source, /focus-visible:ring-2/);
  assert.match(source, /motion-reduce:transition-none/);
  assert.match(source, /ChevronDown/);
  assert.match(source, /aria-hidden=["']true["']/);
});
