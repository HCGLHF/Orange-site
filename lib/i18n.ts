import type { Fabric } from "@/lib/data";

export type Locale = "zh" | "en";

export const LOCALE_STORAGE_KEY = "orange-textile-locale";

export type FabricLocaleFields = {
  name: string;
  composition: string;
  description: string;
  tags: string[];
};

export const fabricLocaleEn: Record<number, FabricLocaleFields> = {
  1: {
    name: "32S combed cotton spandex",
    composition: "95% cotton / 5% spandex",
    description: "Soft like a worn-in tee, good recovery—great for slim fits.",
    tags: ["In stock", "T-shirt favorite", "Soft stretch"],
  },
  2: {
    name: "40S pure cotton single jersey",
    composition: "100% combed cotton",
    description: "Light and breathable—the go-to for summer white tees.",
    tags: ["Basics", "Breathable", "Natural white in stock"],
  },
  3: {
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
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  fabricsTitle: string;
  fabricsSubtitle: string;
  storyLabel: string;
  storyTitle: string;
  storyBody: string;
  footer: string;
  fabricAltTexture: string;
  fabricAltScene: string;
  fabricShooting: string;
  fabricPlaceholderHint: string;
  fabricDetailsHover: string;
  fabricToggleScene: string;
  fabricToggleTexture: string;
  fabricSwatchCta: string;
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
};

export const messages: Record<Locale, Messages> = {
  zh: {
    navAria: "主导航",
    navHome: "首页",
    navFabrics: "面料",
    navInquiry: "询价",
    navContact: "联系",
    heroBadge: "Shaoxing Textile Trading",
    heroTitle: "O'range 诗橙",
    heroSubtitle: "Soft Touch from Shaoxing",
    heroCta: "免费索取样品",
    fabricsTitle: "Featured Fabrics",
    fabricsSubtitle: "精选针织面料",
    storyLabel: "Brand Story",
    storyTitle: "触感如诗，橙色温度",
    storyBody:
      "我们扎根绍兴，以稳定织造、细腻手感和快速响应服务全球客户。O'range 诗橙坚持把每一匹面料做到可感知的温度，让设计灵感从触感开始。",
    footer: "绍兴诗橙纺织品贸易公司 · 欢迎洽询合作",
    fabricAltTexture: "面料纹理占位",
    fabricAltScene: "成衣效果占位",
    fabricShooting: "📷 拍摄中",
    fabricPlaceholderHint: "您的面料照片将展示在这里",
    fabricDetailsHover: "查看详细参数",
    fabricToggleScene: "查看成衣效果",
    fabricToggleTexture: "查看面料纹理",
    fabricSwatchCta: "点击索取实物色卡",
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
    inquiryMailSubject: "[O'range 诗橙] 样品索取",
    inquiryMailName: "姓名",
    inquiryMailEmail: "邮箱",
    inquiryMailCompany: "公司",
    inquiryMailFabric: "感兴趣面料",
    inquiryMailQty: "需求数量",
    inquiryMailTime: "提交时间",
    langZh: "中文",
    langEn: "English",
    langToggleAria: "切换语言",
  },
  en: {
    navAria: "Main navigation",
    navHome: "Home",
    navFabrics: "Fabrics",
    navInquiry: "Inquiry",
    navContact: "Contact",
    heroBadge: "Shaoxing Textile Trading",
    heroTitle: "O'range",
    heroSubtitle: "Soft Touch from Shaoxing",
    heroCta: "Request free samples",
    fabricsTitle: "Featured fabrics",
    fabricsSubtitle: "Selected knits",
    storyLabel: "Brand story",
    storyTitle: "Poetry in touch, warmth in orange",
    storyBody:
      "Based in Shaoxing, we serve global clients with stable weaving, refined hand-feel, and responsive service. O'range brings perceptible warmth to every roll—so your ideas start from touch.",
    footer: "Shaoxing Shicheng Textile Trading · Inquiries welcome",
    fabricAltTexture: "Fabric texture placeholder",
    fabricAltScene: "Garment photo placeholder",
    fabricShooting: "📷 Shoot in progress",
    fabricPlaceholderHint: "Your fabric photos will appear here",
    fabricDetailsHover: "View specifications",
    fabricToggleScene: "View garment",
    fabricToggleTexture: "View texture",
    fabricSwatchCta: "Request physical swatches",
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
    inquiryMailSubject: "[O'range] Sample request",
    inquiryMailName: "Name",
    inquiryMailEmail: "Email",
    inquiryMailCompany: "Company",
    inquiryMailFabric: "Fabric",
    inquiryMailQty: "Quantity",
    inquiryMailTime: "Submitted at",
    langZh: "中文",
    langEn: "English",
    langToggleAria: "Switch language",
  },
};
