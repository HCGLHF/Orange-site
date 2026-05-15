import type { Fabric } from "@/lib/data";

export type Locale = "zh" | "en";

export const LOCALE_STORAGE_KEY = "orange-textile-locale";

export type FabricLocaleFields = {
  name: string;
  composition: string;
  description: string;
  tags: string[];
};

export const fabricLocaleEn: Record<string, FabricLocaleFields> = {
  "1": {
    name: "32S combed cotton spandex jersey",
    composition: "95% cotton / 5% spandex",
    description: "Soft worn-in hand feel with reliable recovery for fitted tees.",
    tags: ["In stock", "T-shirt favorite", "Soft stretch"],
  },
  "2": {
    name: "40S pure cotton single jersey",
    composition: "100% combed cotton",
    description: "Light, breathable and clean for summer white tee programs.",
    tags: ["Basics", "Breathable", "Natural white in stock"],
  },
  "3": {
    name: "Poly-cotton scuba air-layer knit",
    composition: "65% polyester / 35% cotton",
    description: "Structured air-layer knit with a stable body for hoodies.",
    tags: ["Structured", "Sweatshirt fabric", "Warm"],
  },
};

export function getFabricCopy(fabric: Fabric, locale: Locale): FabricLocaleFields {
  void locale;
  return fabricLocaleEn[fabric.id] ?? {
    name: fabric.name,
    composition: fabric.composition,
    description: fabric.description,
    tags: fabric.tags,
  };
}

export type Messages = {
  navAria: string;
  navHome: string;
  navFabrics: string;
  navInquiry: string;
  navContact: string;
  navStockFast: string;
  navStockPreorder: string;
  navFabricsAll: string;
  navBadge24h: string;
  navCtaInquiry: string;
  navCartAria: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  ctaButton: string;
  trustBadges: readonly [string, string, string];
  fabricsTitle: string;
  fabricsSubtitle: string;
  fabricsViewAll: string;
  fabricsEmpty: string;
  whyTitle: string;
  whyFactoryTitle: string;
  whyFactoryDesc: string;
  whySpeedTitle: string;
  whySpeedDesc: string;
  whyExportTitle: string;
  whyExportDesc: string;
  storyLabel: string;
  storyTitle: string;
  storyBody: string;
  footer: string;
  footerContact: string;
  fabricCardLoading: string;
  fabricAltTexture: string;
  fabricAltScene: string;
  fabricShooting: string;
  fabricPlaceholderHint: string;
  fabricDetailsHover: string;
  fabricToggleScene: string;
  fabricToggleTexture: string;
  fabricSwatchCta: string;
  fabricPdfCard: string;
  fabricPdfGenerating: string;
  fabricPdfTitle: string;
  fabricPdfError: string;
  fabricInquiryCta: string;
  fabricInquiryCartAdd: string;
  fabricInquiryCartAdded: string;
  fabricInquiryCartOverlay: string;
  fabricInquiryCartToggleAria: string;
  inquiryTitle: string;
  inquirySubtitle: string;
  inquirySuccess: string;
  inquiryOk: string;
  inquiryClose: string;
  inquiryName: string;
  inquiryEmail: string;
  inquiryCompany: string;
  inquiryFabric: string;
  inquiryQuantity: string;
  inquiryQtyPlaceholder: string;
  inquiryCancel: string;
  inquirySubmit: string;
  inquiryFootnote: string;
  inquiryErrNameEmail: string;
  inquiryErrFabric: string;
  inquiryErrQty: string;
  inquiryMailSubject: string;
  inquiryMailName: string;
  inquiryMailEmail: string;
  inquiryMailCompany: string;
  inquiryMailFabric: string;
  inquiryMailQty: string;
  inquiryMailTime: string;
  langZh: string;
  langEn: string;
  langToggleAria: string;
  fabricsLibraryTitle: string;
  fabricsLibrarySubtitle: string;
  filterTitle: string;
  filterStockStatus: string;
  filterComposition: string;
  filterWeight: string;
  filterAll: string;
  filterInStock: string;
  filterPreorder: string;
  filterOutOfStock: string;
  filterCotton: string;
  filterSpandex: string;
  filterPolyester: string;
  filterLight: string;
  filterMedium: string;
  filterHeavy: string;
  filterShowing: string;
  filterFabrics: string;
  filterClear: string;
  filterNoMatch: string;
  scenarioNavLabel: string;
  scenarioNavAll: string;
  scenarioNavFiltered: string;
  scenarioNavClear: string;
  inquiryBarSelectedPrefix: string;
  inquiryBarSelectedSuffix: string;
  inquiryBarViewList: string;
  inquiryBarClear: string;
  inquiryBatchTitle: string;
  inquiryBatchSubtitle: string;
  inquiryBatchListTitle: string;
  inquiryBatchQty: string;
  inquiryBatchMeters: string;
  inquiryBatchPhone: string;
  inquiryBatchNotes: string;
  inquiryBatchNotesPlaceholder: string;
  inquiryBatchSubmit: string;
  inquiryBatchFootnote: string;
  inquiryBatchSuccessTitle: string;
  inquiryBatchSuccessBody: string;
  inquiryErrPhone: string;
  inquiryPhCustomer: string;
  inquiryPhPhone: string;
  inquiryPhEmail: string;
  inquiryPhCompanyBatch: string;
  inquiryBatchRemoveLine: string;
  inquirySubmitFailed: string;
};

export type MessageStringKey = Exclude<keyof Messages, "trustBadges">;

const englishMessages: Messages = {
  navAria: "Main navigation",
  navHome: "Home",
  navFabrics: "Fabrics",
  navInquiry: "Inquiry",
  navContact: "Contact",
  navStockFast: "In-stock fabrics",
  navStockPreorder: "Preorder fabrics",
  navFabricsAll: "All knit fabrics",
  navBadge24h: "24h",
  navCtaInquiry: "Request samples",
  navCartAria: "Inquiry cart",
  heroBadge: "Keqiao, Shaoxing | Premium knits",
  heroTitle: "O'range Textile",
  heroSubtitle:
    "Shaoxing Shicheng Textile Products Co., Ltd. | Premium knit fabrics from Shaoxing",
  heroTagline: "Soft touch, reliable quality, built for global apparel brands",
  ctaButton: "Request free sample",
  trustBadges: ["48-hour sampling", "3000m MOQ", "OEKO-TEX ready"],
  fabricsTitle: "Featured fabrics",
  fabricsSubtitle: "Selected knit programs",
  fabricsViewAll: "View all",
  fabricsEmpty: "No fabrics to show yet",
  whyTitle: "Why O'range?",
  whyFactoryTitle: "In-house mill",
  whyFactoryDesc: "20,000 m2 modern production floor",
  whySpeedTitle: "Fast response",
  whySpeedDesc: "In-stock orders ship within 24 hours",
  whyExportTitle: "Export expertise",
  whyExportDesc: "Serving Europe, the Americas, Middle East and Southeast Asia",
  storyLabel: "Brand story",
  storyTitle: "Premium knits from Shaoxing Keqiao",
  storyBody:
    "Based in Shaoxing, we serve global clients with stable weaving, refined hand feel and responsive service. O'range brings predictable quality to every roll so development teams can move from swatch to production with confidence.",
  footer: "Shaoxing Shicheng Textile Products Co., Ltd. | Inquiries welcome",
  footerContact: "WhatsApp: +86 138-xxxx-xxxx",
  fabricCardLoading: "Loading fabric",
  fabricAltTexture: "Fabric texture placeholder",
  fabricAltScene: "Garment photo placeholder",
  fabricShooting: "Photo pending",
  fabricPlaceholderHint: "Fabric photos will appear here",
  fabricDetailsHover: "View specifications",
  fabricToggleScene: "View garment",
  fabricToggleTexture: "View texture",
  fabricSwatchCta: "Request physical swatches",
  fabricPdfCard: "PDF card",
  fabricPdfGenerating: "Generating",
  fabricPdfTitle: "Download fabric card PDF",
  fabricPdfError: "Could not generate the PDF. Please try again.",
  fabricInquiryCta: "Inquire now",
  fabricInquiryCartAdd: "Add to inquiry",
  fabricInquiryCartAdded: "Added",
  fabricInquiryCartOverlay: "Added to inquiry list",
  fabricInquiryCartToggleAria: "Add or remove from inquiry list",
  inquiryTitle: "Request free samples",
  inquirySubtitle: "Submit your details and our team will get back to you shortly.",
  inquirySuccess: "Our fabric specialist will contact you within 24 hours",
  inquiryOk: "OK",
  inquiryClose: "Close",
  inquiryName: "Name",
  inquiryEmail: "Email",
  inquiryCompany: "Company",
  inquiryFabric: "Fabric of interest",
  inquiryQuantity: "Quantity needed",
  inquiryQtyPlaceholder: "e.g. 500 kg, first-run sampling",
  inquiryCancel: "Cancel",
  inquirySubmit: "Submit",
  inquiryFootnote:
    "Submissions are saved on this device. Set NEXT_PUBLIC_INQUIRY_EMAIL to also open a draft email.",
  inquiryErrNameEmail: "Please enter your name and email.",
  inquiryErrFabric: "Please select a fabric.",
  inquiryErrQty: "Please enter the quantity needed.",
  inquiryMailSubject:
    "[Shaoxing Shicheng Textile Products Co., Ltd.] Sample request",
  inquiryMailName: "Name",
  inquiryMailEmail: "Email",
  inquiryMailCompany: "Company",
  inquiryMailFabric: "Fabric",
  inquiryMailQty: "Quantity",
  inquiryMailTime: "Submitted at",
  langZh: "English",
  langEn: "English",
  langToggleAria: "Language selector",
  fabricsLibraryTitle: "Knit fabric library",
  fabricsLibrarySubtitle:
    "Browse cotton jersey, cotton spandex jersey, rib, fleece, terry and air-layer knit fabrics. Add fabrics to your RFQ or request samples from O'range Textile.",
  filterTitle: "Filters",
  filterStockStatus: "Stock status",
  filterComposition: "Composition",
  filterWeight: "Weight / season",
  filterAll: "All",
  filterInStock: "In stock",
  filterPreorder: "Preorder",
  filterOutOfStock: "Out of stock",
  filterCotton: "Cotton",
  filterSpandex: "Stretch (Spandex)",
  filterPolyester: "Polyester",
  filterLight: "Summer Light (<180g)",
  filterMedium: "All Season (180-250g)",
  filterHeavy: "Heavy (>250g)",
  filterShowing: "Showing",
  filterFabrics: "fabrics",
  filterClear: "Clear filters",
  filterNoMatch: "No fabrics match your filters",
  scenarioNavLabel: "Shop by use case",
  scenarioNavAll: "All scenarios",
  scenarioNavFiltered: "Filtered:",
  scenarioNavClear: "Clear",
  inquiryBarSelectedPrefix: "Selected",
  inquiryBarSelectedSuffix: "fabrics",
  inquiryBarViewList: "View list",
  inquiryBarClear: "Clear all",
  inquiryBatchTitle: "Batch inquiry",
  inquiryBatchSubtitle:
    "{count} fabrics selected. Fill in the form below to submit.",
  inquiryBatchListTitle: "Inquiry list",
  inquiryBatchQty: "Qty",
  inquiryBatchMeters: "m",
  inquiryBatchPhone: "Phone",
  inquiryBatchNotes: "Notes",
  inquiryBatchNotesPlaceholder:
    "Special requirements, delivery timeline, target price",
  inquiryBatchSubmit: "Submit inquiry",
  inquiryBatchFootnote:
    "Our team will reach out by phone or email within 24 hours.",
  inquiryBatchSuccessTitle: "Submitted",
  inquiryBatchSuccessBody: "We will contact you within 24 hours.",
  inquiryErrPhone: "Please enter your phone number.",
  inquiryPhCustomer: "Your full name",
  inquiryPhPhone: "+1 or +86",
  inquiryPhEmail: "example@company.com",
  inquiryPhCompanyBatch: "Company name",
  inquiryBatchRemoveLine: "Remove from list",
  inquirySubmitFailed:
    "Submission failed. Please try again or email us directly.",
};

export const messages: Record<Locale, Messages> = {
  zh: englishMessages,
  en: englishMessages,
};
