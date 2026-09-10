export const INQUIRY_HREF = "/fabrics#inquiry-form";

export type NavigationGroupId = "products" | "resources";
export type NavigationTopLevelId =
  | NavigationGroupId
  | "custom-development"
  | "about";
export type ActiveNavigationId = NavigationTopLevelId | "home" | null;

export type NavigationLink = {
  id: string;
  label: string;
  href: string;
};

export type NavigationGroup = {
  kind: "group";
  id: NavigationGroupId;
  label: string;
  items: readonly NavigationLink[];
};

export type NavigationDirectLink = {
  kind: "link";
  id: Exclude<NavigationTopLevelId, NavigationGroupId>;
  label: string;
  href: string;
};

export type NavigationSection = NavigationGroup | NavigationDirectLink;

export const PRIMARY_NAVIGATION = [
  {
    kind: "group",
    id: "products",
    label: "Products",
    items: [
      {
        id: "structured",
        label: "Air-Layer & Structured Knits",
        href: "/fabrics?collection=structured",
      },
      {
        id: "soft-touch",
        label: "Soft-Touch & Wool-Blend Knits",
        href: "/fabrics?collection=soft-touch",
      },
      {
        id: "textured",
        label: "Textured & Brushed Knits",
        href: "/fabrics?collection=textured",
      },
      {
        id: "view-all-fabrics",
        label: "View All Fabrics",
        href: "/fabrics",
      },
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
      {
        id: "double-knit-guide",
        label: "What Is Double Knit Fabric?",
        href: "/blog/what-is-double-knit-fabric",
      },
      {
        id: "interlock-guide",
        label: "What Is Interlock Fabric?",
        href: "/blog/what-is-interlock-fabric",
      },
      {
        id: "ponte-guide",
        label: "What Is Ponte Fabric?",
        href: "/blog/what-is-ponte-fabric",
      },
      {
        id: "view-all-guides",
        label: "View All Buyer Guides",
        href: "/blog",
      },
    ],
  },
  {
    kind: "link",
    id: "about",
    label: "About",
    href: "/about",
  },
] as const satisfies readonly NavigationSection[];

type ConfiguredNavigationSection = (typeof PRIMARY_NAVIGATION)[number];
type ConfiguredNavigationGroup =
  Extract<ConfiguredNavigationSection, { kind: "group" }>;
type ConfiguredNavigationLink =
  Extract<ConfiguredNavigationSection, { kind: "link" }>;

export type CurrentNavigationItemId =
  | "home"
  | ConfiguredNavigationLink["id"]
  | ConfiguredNavigationGroup["items"][number]["id"];

const CURRENT_ITEM_BY_PATHNAME: Readonly<
  Record<string, CurrentNavigationItemId>
> = Object.freeze({
  "/": "home",
  "/fabrics": "view-all-fabrics",
  "/custom-knit-fabric-development": "custom-development",
  "/blog/what-is-double-knit-fabric": "double-knit-guide",
  "/blog/what-is-interlock-fabric": "interlock-guide",
  "/blog/what-is-ponte-fabric": "ponte-guide",
  "/blog": "view-all-guides",
  "/about": "about",
});

export function getCurrentNavigationItemId(
  pathname: string,
  search: string = ""
): CurrentNavigationItemId | null {
  if (pathname === "/fabrics") {
    const collection = new URLSearchParams(search).get("collection");
    if (collection === "structured" || collection === "soft-touch" || collection === "textured") {
      return collection;
    }
  }
  return CURRENT_ITEM_BY_PATHNAME[pathname] ?? null;
}

const configuredHrefs = PRIMARY_NAVIGATION.flatMap((section) =>
  section.kind === "group"
    ? section.items.map((item) => item.href)
    : [section.href]
);

export const NAVIGATION_DISCOVERY_HREFS: readonly string[] = Object.freeze(
  // Inquiry is a dialog action. Discovery contains actual crawlable route links.
  Array.from(new Set(configuredHrefs))
);

export function getActiveNavigationId(
  pathname: string
): ActiveNavigationId {
  if (pathname === "/") return "home";
  if (
    pathname === "/fabrics" ||
    pathname.startsWith("/fabrics/") ||
    pathname === "/ready-stock-knit-fabrics" ||
    pathname === "/finished-double-knit-fabrics"
  ) {
    return "products";
  }
  if (pathname === "/custom-knit-fabric-development") {
    return "custom-development";
  }
  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return "resources";
  }
  if (pathname === "/about") return "about";
  return null;
}
