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
        id: "ready-stock",
        label: "Ready Stock",
        href: "/ready-stock-knit-fabrics",
      },
      {
        id: "finished-knit-fabrics",
        label: "Finished Knit Fabrics",
        href: "/fabrics",
      },
      {
        id: "double-knit-manufacturing",
        label: "Double-Knit Manufacturing",
        href: "/finished-double-knit-fabrics",
      },
      {
        id: "interlock-fabric",
        label: "Interlock Fabric",
        href: "/fabrics/interlock-fabric",
      },
      {
        id: "ponte-roma-fabric",
        label: "Ponte Roma Fabric",
        href: "/fabrics/ponte-roma-fabric",
      },
      {
        id: "rib-knit-fabric",
        label: "Rib Knit Fabric",
        href: "/fabrics/rib-knit-fabric",
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

const configuredHrefs = PRIMARY_NAVIGATION.flatMap((section) =>
  section.kind === "group"
    ? section.items.map((item) => item.href)
    : [section.href]
);

export const NAVIGATION_DISCOVERY_HREFS = Array.from(
  new Set([...configuredHrefs, INQUIRY_HREF])
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
