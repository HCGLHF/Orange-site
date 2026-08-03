export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
};

export type LegalPageContent = {
  effectiveDate: string;
  introduction: string;
  sections: readonly LegalSection[];
};

export const PRIVACY_CONTENT = {
  effectiveDate: "August 3, 2026",
  introduction:
    "This policy explains how O'range Textile handles inquiry information and uses privacy-conscious website measurement.",
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      paragraphs: [
        "O'range Textile is the export-facing textile business of Shaoxing Shicheng Textile Products Co., Ltd. This policy applies to information handled through orangetextiles.com.",
      ],
    },
    {
      id: "information-you-provide",
      title: "Information you provide",
      paragraphs: [
        "When you submit an inquiry, you may provide your name, email address, telephone number, company, product selections, quantity and notes. We use this information to review the request, communicate with you and support the related sourcing discussion.",
      ],
    },
    {
      id: "browser-storage",
      title: "Browser storage",
      paragraphs: [
        "The website stores your Analytics choice in a dedicated versioned localStorage record. Existing inquiry functionality separately stores a copy of submitted inquiry details in your browser until that browser storage is cleared and sends inquiry details to Formspree and, when configured, Notion and the business email workflow. Analytics code does not read those inquiry records.",
      ],
    },
    {
      id: "analytics-by-default",
      title: "Analytics by default",
      paragraphs: [
        "We use Google Analytics 4 through Google Tag Manager to measure traffic, page interaction and completed inquiry conversions. Before Google Tag Manager starts, Google Consent Mode sets analytics storage, advertising storage, advertising user data and advertising personalisation to denied.",
      ],
    },
    {
      id: "accepting-analytics-cookies",
      title: "Accepting Analytics cookies",
      paragraphs: [
        "If you select Accept, analytics storage becomes granted and Google Analytics may set first-party cookies including _ga and a stream-specific _ga_* cookie. These cookies are generally configured for up to two years, although browser controls or later configuration may shorten their life. Advertising storage, advertising user data, advertising personalisation, Google Signals and user-provided data collection remain disabled.",
      ],
    },
    {
      id: "what-analytics-receives",
      title: "What Analytics receives",
      paragraphs: [
        "When Analytics is denied, Google tags may still send limited cookieless measurement requests containing consent status and technical request, device and page information. We do not describe this processing as anonymous. Google Analytics does not receive the name, email address, telephone number, company, notes, quantity or other content entered in an inquiry form.",
      ],
    },
    {
      id: "providers-and-international-processing",
      title: "Providers and international processing",
      paragraphs: [
        "Google provides GA4 and Google Tag Manager. Formspree receives website inquiry submissions, and Notion may receive them when that integration is configured. These providers may process information in countries outside your location under their own terms and privacy arrangements.",
      ],
    },
    {
      id: "retention",
      title: "Retention",
      paragraphs: [
        "GA4 event-level data retention is set to two months. Inquiry information is retained only for as long as reasonably required to respond, keep business records and meet applicable obligations; O'range Textile has not represented a more specific public retention schedule.",
      ],
    },
    {
      id: "your-choices-and-requests",
      title: "Your choices and requests",
      paragraphs: [
        "You can reopen the choice bar at any time through Privacy settings in the footer. Declining withdraws permission for Analytics cookies but retains the limited cookieless measurement described above.",
        "You may contact Shaoxing Shicheng Textile Products Co., Ltd. to request access to, or correction of, inquiry information you have provided, or to raise a privacy complaint. Email folenchen0401@outlook.com with enough information for us to identify the relevant inquiry and understand your request. We will consider and respond to it in line with applicable requirements.",
      ],
    },
    {
      id: "changes-and-contact",
      title: "Changes and contact",
      paragraphs: [
        "We may update this policy when website practices, providers or applicable requirements change. The effective date above identifies this version. Questions can be sent to folenchen0401@outlook.com.",
      ],
    },
  ],
} as const satisfies LegalPageContent;

export const TERMS_CONTENT = {
  effectiveDate: "August 3, 2026",
  introduction:
    "These terms govern use of the O'range Textile website and the submission of sourcing inquiries through it.",
  sections: [
    {
      id: "using-this-website",
      title: "Using this website",
      paragraphs: [
        "You may use this website to review public textile information, explore sourcing routes and contact O'range Textile for legitimate business purposes. By using the website, you agree to comply with these terms.",
      ],
    },
    {
      id: "informational-fabric-content",
      title: "Informational fabric content",
      paragraphs: [
        "Fabric descriptions, articles, images, specifications and sourcing guidance are provided for general information. They are not a sample approval, test report, warranty or confirmation that a specific article is currently available or suitable for a particular garment program.",
      ],
    },
    {
      id: "inquiries-and-orders",
      title: "Inquiries and orders",
      paragraphs: [
        "Submitting an inquiry asks O'range Textile to review a possible sourcing requirement. It does not create an order, reservation, exclusivity arrangement or binding supply contract. Composition, GSM, usable width, colour, finish, sample route, testing, quantity, stock status, price, lead time, capacity, documentation and delivery terms require current written confirmation for the specific inquiry.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        "The website and its original text, layout, graphics, brand elements and other materials are protected by applicable intellectual property rights. You may use them for ordinary evaluation of O'range Textile's services, but may not reproduce or distribute substantial parts for another commercial purpose without permission.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: [
        "Do not misuse the website, interfere with its operation, attempt unauthorised access, submit unlawful or harmful material, impersonate another person or use automated activity that unreasonably burdens the service.",
      ],
    },
    {
      id: "external-services",
      title: "External services",
      paragraphs: [
        "The website uses external services including Google Analytics 4, Google Tag Manager, Formspree and, when configured, Notion. Links or integrations supplied by external providers are also subject to the relevant provider's terms and practices.",
      ],
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      paragraphs: [
        "We aim to keep website information useful and current, but the website is provided on an as-available basis. Verify material facts through a current written quotation, specification, sample and any required testing before making a sourcing decision.",
      ],
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of liability",
      paragraphs: [
        "To the extent permitted by applicable law, O'range Textile is not responsible for indirect or consequential loss arising only from reliance on general website content or temporary website unavailability. Nothing in these terms excludes a right or liability that cannot lawfully be excluded.",
      ],
    },
    {
      id: "changes-and-contact",
      title: "Changes and contact",
      paragraphs: [
        "We may update these terms as the website or its services change. The effective date above identifies this version. Questions about these terms can be sent to folenchen0401@outlook.com.",
      ],
    },
  ],
} as const satisfies LegalPageContent;
