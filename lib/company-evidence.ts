export const companyRelationship = {
  brandName: "O'range Textile",
  exportCompany: "Shaoxing Shicheng Textile Products Co., Ltd.",
  parentCompany: "Shaoxing Jingtian Textile Technology Co., Ltd.",
  exportRole:
    "International sales, buyer communication, sampling coordination and export order support",
  parentRole:
    "Knitting capability, manufacturing coordination and certificate-holder operations",
  location: "Shaoxing Keqiao, Zhejiang, China",
} as const;

export const manufacturingScale = [
  {
    value: "200+",
    label: "circular knitting machines",
    detail: "Rounded public count from the parent company's documented machine record.",
  },
  {
    value: "17",
    label: "machine configurations",
    detail: "Documented configurations summarized without publishing the private inventory.",
  },
  {
    value: "60+",
    label: "84-feeder double-knit machines",
    detail: "Rounded public count for the 84-feeder double-knit group in the parent company's documented machine record.",
  },
  {
    value: "40+",
    label: "72-feeder rib machines",
    detail: "Rounded public count for the 72-feeder rib group in the parent company's documented machine record.",
  },
  {
    value: "100+",
    label: "72-feeder double-knit machines",
    detail: "Rounded public count for the 72-feeder double-knit group in the parent company's documented machine record.",
  },
] as const;

export const certificationEvidence = {
  standard: "Global Recycled Standard",
  shortName: "GRS",
  version: "4.0",
  holder: companyRelationship.parentCompany,
  certificationBody: "TÜV Rheinland (China) Ltd.",
  scopeCertificateNumber: "TRC-GRS-350849-00",
  productCategory: "Greige fabrics",
  productDetail: "Knitted fabrics",
  process: "Knitting",
  validUntil: "2027-04-19",
  qualification:
    "Scope certification does not prove that a delivered product is GRS certified. Shipment-level claims require a valid Transaction Certificate or equivalent supporting documentation for the applicable order.",
} as const;

export const knittingDirections = [
  {
    name: "Ponte Roma",
    href: "/fabrics/ponte-roma-fabric",
    description: "Structured double-knit fabric direction for stable apparel silhouettes.",
  },
  {
    name: "Air-layer and scuba",
    href: "/fabrics/scuba-air-layer-fabric",
    description: "Layered knit directions with body and a smooth surface feel.",
  },
  {
    name: "Interlock",
    href: "/fabrics/interlock-fabric",
    description: "Balanced double-knit construction for soft, clean fabric development.",
  },
  {
    name: "Rib knit",
    href: "/fabrics/rib-knit-fabric",
    description: "Elastic knit direction for trims, fitted styles and texture-led programs.",
  },
] as const;
