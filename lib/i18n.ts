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
    name: "32S combed cotton spandex",
    composition: "95% cotton / 5% spandex",
    description: "Soft like a worn-in tee, good recovery—great for slim fits.",
    tags: ["In stock", "T-shirt favorite", "Soft stretch"],
  },
  "2": {
    name: "40S pure cotton single jersey",
    composition: "100% combed cotton",
    description: "Light and breathable—the go-to for summer white tees.",
    tags: ["Basics", "Breathable", "Natural white in stock"],
  },
  "3": {
    name: "Poly-cotton scuba / air layer",
    composition: "65% polyester / 35% cotton",
    description: "Air-layer structure with body—great structure for hoodies.",
    tags: ["Structured", "Sweatshirt fabric", "Warm"],
  },
};

export function getFabricCopy(fabric: Fabric, locale: Locale): FabricLocaleFields {
  if (locale === "zh") {
    return {
      name: fabric.name,
      composition: fabric.composition,
      description: fabric.description,
      tags: fabric.tags,
    };
  }
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
  fabricCraftStoryHoverHint: string;
  fabricCraftStoryOpen: string;
  fabricCraftStoryTitle: string;
  fabricCraftStoryBack: string;
  fabricCraftBulletSample: string;
  fabricCraftStorySummary: string;
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
  /** 使用 {count} 作为数量占位符 */
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

export const messages: Record<Locale, Messages> = {
  zh: {
    navAria: "主导航",
    navHome: "首页",
    navFabrics: "面料",
    navInquiry: "询价",
    navContact: "联系",
    navStockFast: "现货速发",
    navStockPreorder: "预定专区",
    navFabricsAll: "全部面料",
    navBadge24h: "24h",
    navCtaInquiry: "立即询价",
    navCartAria: "询价清单",
    heroBadge: "绍兴柯桥 · 精梳针织",
    heroTitle: "O'range 诗橙",
    heroSubtitle: "绍兴诗橙纺织品有限公司 · 来自绍兴柯桥的精梳针织面料",
    heroTagline: "触感如诗，橙色温度 —— 服务全球服装品牌",
    ctaButton: "免费索取样品",
    trustBadges: ["✓ 48小时打样", "✓ 3000米起订", "✓ OEKO-TEX认证"],
    fabricsTitle: "Featured Fabrics",
    fabricsSubtitle: "精选针织面料",
    fabricsViewAll: "查看全部",
    fabricsEmpty: "暂无面料数据",
    whyTitle: "为什么选择诗橙？",
    whyFactoryTitle: "自有工厂",
    whyFactoryDesc: "20000㎡现代化车间",
    whySpeedTitle: "快速响应",
    whySpeedDesc: "现货24小时发货",
    whyExportTitle: "外贸经验",
    whyExportDesc: "服务欧美/中东/东南亚",
    storyLabel: "Brand Story",
    storyTitle: "触感如诗，橙色温度",
    storyBody:
      "我们扎根绍兴，以稳定织造、细腻手感和快速响应服务全球客户。O'range 诗橙坚持把每一匹面料做到可感知的温度，让设计灵感从触感开始。",
    footer: "绍兴诗橙纺织品有限公司 · 欢迎洽询合作",
    footerContact: "WhatsApp: +86 138-xxxx-xxxx",
    fabricCardLoading: "数据加载中…",
    fabricAltTexture: "面料纹理占位",
    fabricAltScene: "成衣效果占位",
    fabricShooting: "📷 拍摄中",
    fabricPlaceholderHint: "您的面料照片将展示在这里",
    fabricDetailsHover: "查看详细参数",
    fabricToggleScene: "查看成衣效果",
    fabricToggleTexture: "查看面料纹理",
    fabricSwatchCta: "点击索取实物色卡",
    fabricPdfCard: "面料卡",
    fabricPdfGenerating: "生成中…",
    fabricPdfTitle: "下载面料卡 PDF",
    fabricPdfError: "PDF 生成失败，请重试",
    fabricInquiryCta: "立即询价",
    fabricInquiryCartAdd: "加入询价",
    fabricInquiryCartAdded: "已添加",
    fabricInquiryCartOverlay: "已加入询价单",
    fabricInquiryCartToggleAria: "加入或移出询价单",
    fabricCraftStoryHoverHint: "悬停看工艺",
    fabricCraftStoryOpen: "查看工艺故事",
    fabricCraftStoryTitle: "工艺故事",
    fabricCraftStoryBack: "返回查看参数",
    fabricCraftBulletSample: "支持免费寄样（A4 大小）",
    fabricCraftStorySummary: "工艺故事",
    inquiryTitle: "免费索取样品",
    inquirySubtitle: "填写信息后，我们会尽快与您联系。",
    inquirySuccess: "我们的面料专家将在24小时内联系您",
    inquiryOk: "好的",
    inquiryClose: "关闭",
    inquiryName: "姓名",
    inquiryEmail: "邮箱",
    inquiryCompany: "公司",
    inquiryFabric: "感兴趣面料",
    inquiryQuantity: "需求数量",
    inquiryQtyPlaceholder: "例如：500kg、首单打样",
    inquiryCancel: "取消",
    inquirySubmit: "提交",
    inquiryFootnote:
      "提交后信息会保存到本机；设置环境变量 NEXT_PUBLIC_INQUIRY_EMAIL 可同时打开发件邮件。",
    inquiryErrNameEmail: "请填写姓名与邮箱。",
    inquiryErrFabric: "请选择感兴趣的面料。",
    inquiryErrQty: "请填写需求数量。",
    inquiryMailSubject: "[绍兴诗橙纺织品] 样品索取",
    inquiryMailName: "姓名",
    inquiryMailEmail: "邮箱",
    inquiryMailCompany: "公司",
    inquiryMailFabric: "感兴趣面料",
    inquiryMailQty: "需求数量",
    inquiryMailTime: "提交时间",
    langZh: "中文",
    langEn: "English",
    langToggleAria: "切换语言",
    fabricsLibraryTitle: "诗橙面料库",
    fabricsLibrarySubtitle:
      "选择多款面料批量询价，获得更优报价；可按成分、克重、库存筛选",
    filterTitle: "筛选",
    filterStockStatus: "库存状态",
    filterComposition: "成分特点",
    filterWeight: "克重/季节",
    filterAll: "全部",
    filterInStock: "现货",
    filterPreorder: "预定",
    filterOutOfStock: "缺货",
    filterCotton: "含棉面料",
    filterSpandex: "弹力(含氨纶)",
    filterPolyester: "含涤面料",
    filterLight: "夏季薄款(<180g)",
    filterMedium: "四季常规(180-250g)",
    filterHeavy: "厚款(>250g)",
    filterShowing: "显示",
    filterFabrics: "款面料",
    filterClear: "清除筛选",
    filterNoMatch: "没有找到符合条件的面料",
    scenarioNavLabel: "按场景选面料",
    scenarioNavAll: "全部场景",
    scenarioNavFiltered: "已筛选：",
    scenarioNavClear: "清除筛选",
    inquiryBarSelectedPrefix: "已选",
    inquiryBarSelectedSuffix: "款面料",
    inquiryBarViewList: "查看清单",
    inquiryBarClear: "清空",
    inquiryBatchTitle: "批量询价单",
    inquiryBatchSubtitle: "已选择 {count} 款面料，填写信息后提交",
    inquiryBatchListTitle: "询价清单",
    inquiryBatchQty: "数量",
    inquiryBatchMeters: "米",
    inquiryBatchPhone: "联系电话",
    inquiryBatchNotes: "备注需求",
    inquiryBatchNotesPlaceholder: "特殊要求、交货时间、目标价格等...",
    inquiryBatchSubmit: "提交询价单",
    inquiryBatchFootnote: "提交后我们的业务员会在24小时内通过电话或邮件联系您",
    inquiryBatchSuccessTitle: "提交成功！",
    inquiryBatchSuccessBody: "我们会在24小时内联系您",
    inquiryErrPhone: "请填写联系电话。",
    inquiryPhCustomer: "请输入姓名",
    inquiryPhPhone: "+86",
    inquiryPhEmail: "example@company.com",
    inquiryPhCompanyBatch: "请输入公司名",
    inquiryBatchRemoveLine: "从清单移除",
    inquirySubmitFailed: "提交失败，请稍后重试或直接邮件联系。",
  },
  en: {
    navAria: "Main navigation",
    navHome: "Home",
    navFabrics: "Fabrics",
    navInquiry: "Inquiry",
    navContact: "Contact",
    navStockFast: "In-stock",
    navStockPreorder: "Pre-order",
    navFabricsAll: "All fabrics",
    navBadge24h: "24h",
    navCtaInquiry: "Inquire now",
    navCartAria: "Inquiry cart",
    heroBadge: "Keqiao, Shaoxing · Premium knits",
    heroTitle: "O'range Textile",
    heroSubtitle:
      "Shaoxing Shicheng Textile Products Co., Ltd. · Premium knit fabrics from Shaoxing",
    heroTagline: "Soft Touch, Strong Quality —— Trusted by 500+ Brands",
    ctaButton: "Request Free Sample",
    trustBadges: [
      "✓ 48hr Sampling",
      "✓ 3000m MOQ",
      "✓ OEKO-TEX Certified",
    ],
    fabricsTitle: "Featured fabrics",
    fabricsSubtitle: "Selected knits",
    fabricsViewAll: "View all",
    fabricsEmpty: "No fabrics to show yet",
    whyTitle: "Why O'range?",
    whyFactoryTitle: "In-house mill",
    whyFactoryDesc: "20,000 m² modern production floor",
    whySpeedTitle: "Fast response",
    whySpeedDesc: "In-stock orders ship within 24 hours",
    whyExportTitle: "Export expertise",
    whyExportDesc: "Serving Europe, the Americas, Middle East & Southeast Asia",
    storyLabel: "Brand story",
    storyTitle: "Poetry in touch, warmth in orange",
    storyBody:
      "Based in Shaoxing, we serve global clients with stable weaving, refined hand-feel, and responsive service. O'range brings perceptible warmth to every roll—so your ideas start from touch.",
    footer: "Shaoxing Shicheng Textile Products Co., Ltd. · Inquiries welcome",
    footerContact: "WhatsApp: +86 138-xxxx-xxxx",
    fabricCardLoading: "Loading fabric…",
    fabricAltTexture: "Fabric texture placeholder",
    fabricAltScene: "Garment photo placeholder",
    fabricShooting: "📷 Shoot in progress",
    fabricPlaceholderHint: "Your fabric photos will appear here",
    fabricDetailsHover: "View specifications",
    fabricToggleScene: "View garment",
    fabricToggleTexture: "View texture",
    fabricSwatchCta: "Request physical swatches",
    fabricPdfCard: "PDF card",
    fabricPdfGenerating: "Generating…",
    fabricPdfTitle: "Download fabric card PDF",
    fabricPdfError: "Could not generate the PDF. Please try again.",
    fabricInquiryCta: "Inquire now",
    fabricInquiryCartAdd: "Add to inquiry",
    fabricInquiryCartAdded: "Added",
    fabricInquiryCartOverlay: "Added to inquiry list",
    fabricInquiryCartToggleAria: "Add or remove from inquiry list",
    fabricCraftStoryHoverHint: "Hover for craft story",
    fabricCraftStoryOpen: "View craft story",
    fabricCraftStoryTitle: "Craft story",
    fabricCraftStoryBack: "Back to specs",
    fabricCraftBulletSample: "Complimentary A4 swatches available",
    fabricCraftStorySummary: "Craft story",
    inquiryTitle: "Request free samples",
    inquirySubtitle: "We’ll get back to you shortly after you submit.",
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
    langZh: "中文",
    langEn: "English",
    langToggleAria: "Switch language",
    fabricsLibraryTitle: "Fabric library",
    fabricsLibrarySubtitle:
      "Add multiple fabrics to your inquiry for better quotes. Filter by composition, weight, or stock.",
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
      "Special requirements, delivery timeline, target price…",
    inquiryBatchSubmit: "Submit inquiry",
    inquiryBatchFootnote:
      "Our team will reach out by phone or email within 24 hours.",
    inquiryBatchSuccessTitle: "Submitted!",
    inquiryBatchSuccessBody: "We’ll contact you within 24 hours.",
    inquiryErrPhone: "Please enter your phone number.",
    inquiryPhCustomer: "Your full name",
    inquiryPhPhone: "+1 or +86",
    inquiryPhEmail: "example@company.com",
    inquiryPhCompanyBatch: "Company name",
    inquiryBatchRemoveLine: "Remove from list",
    inquirySubmitFailed:
      "Submission failed. Please try again or email us directly.",
  },
};
