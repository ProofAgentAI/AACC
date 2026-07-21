// Expert Council taxonomy: domains aligned with the chamber's priority
// sectors, each with U.S.-standard sub-expertise areas. Values are stable
// English keys stored in the database; labels are bilingual.

export type Subdomain = { value: string; en: string; ar: string };
export type Domain = { value: string; en: string; ar: string; subs: Subdomain[] };

export const EXPERT_DOMAINS: Domain[] = [
  {
    value: "Technology & AI",
    en: "Technology & AI",
    ar: "التكنولوجيا والذكاء الاصطناعي",
    subs: [
      { value: "Artificial Intelligence & Machine Learning", en: "Artificial Intelligence & Machine Learning", ar: "الذكاء الاصطناعي وتعلم الآلة" },
      { value: "Software Engineering", en: "Software Engineering", ar: "هندسة البرمجيات" },
      { value: "Data Science & Analytics", en: "Data Science & Analytics", ar: "علوم البيانات والتحليلات" },
      { value: "Cybersecurity", en: "Cybersecurity", ar: "الأمن السيبراني" },
      { value: "Cloud & Infrastructure", en: "Cloud & Infrastructure", ar: "الحوسبة السحابية والبنية التحتية" },
      { value: "Fintech", en: "Fintech", ar: "التكنولوجيا المالية" },
    ],
  },
  {
    value: "Healthcare & Life Sciences",
    en: "Healthcare & Life Sciences",
    ar: "الرعاية الصحية وعلوم الحياة",
    subs: [
      { value: "Medicine & Clinical Care", en: "Medicine & Clinical Care", ar: "الطب والرعاية السريرية" },
      { value: "Pharmacy & Pharmaceuticals", en: "Pharmacy & Pharmaceuticals", ar: "الصيدلة والأدوية" },
      { value: "Biotechnology", en: "Biotechnology", ar: "التقنية الحيوية" },
      { value: "Public Health", en: "Public Health", ar: "الصحة العامة" },
      { value: "Medical Devices", en: "Medical Devices", ar: "الأجهزة الطبية" },
      { value: "Healthcare Administration", en: "Healthcare Administration", ar: "إدارة الرعاية الصحية" },
    ],
  },
  {
    value: "Energy & Industry",
    en: "Energy & Industry",
    ar: "الطاقة والصناعة",
    subs: [
      { value: "Oil & Gas", en: "Oil & Gas", ar: "النفط والغاز" },
      { value: "Renewable Energy", en: "Renewable Energy", ar: "الطاقة المتجددة" },
      { value: "Manufacturing", en: "Manufacturing", ar: "التصنيع" },
      { value: "Mining & Materials", en: "Mining & Materials", ar: "التعدين والمواد" },
      { value: "Utilities & Power", en: "Utilities & Power", ar: "المرافق والكهرباء" },
    ],
  },
  {
    value: "Finance & Investment",
    en: "Finance & Investment",
    ar: "المال والاستثمار",
    subs: [
      { value: "Banking", en: "Banking", ar: "الخدمات المصرفية" },
      { value: "Venture Capital & Private Equity", en: "Venture Capital & Private Equity", ar: "رأس المال المخاطر والملكية الخاصة" },
      { value: "Accounting & Tax (CPA)", en: "Accounting & Tax (CPA)", ar: "المحاسبة والضرائب" },
      { value: "Insurance", en: "Insurance", ar: "التأمين" },
      { value: "Capital Markets", en: "Capital Markets", ar: "أسواق المال" },
    ],
  },
  {
    value: "Legal & Compliance",
    en: "Legal & Compliance",
    ar: "القانون والامتثال",
    subs: [
      { value: "Corporate & Business Law", en: "Corporate & Business Law", ar: "قانون الشركات والأعمال" },
      { value: "Immigration Law", en: "Immigration Law", ar: "قانون الهجرة" },
      { value: "Intellectual Property", en: "Intellectual Property", ar: "الملكية الفكرية" },
      { value: "International Trade Law", en: "International Trade Law", ar: "قانون التجارة الدولية" },
      { value: "Regulatory & Compliance", en: "Regulatory & Compliance", ar: "التنظيم والامتثال" },
    ],
  },
  {
    value: "Trade & Logistics",
    en: "Trade & Logistics",
    ar: "التجارة واللوجستيات",
    subs: [
      { value: "Import / Export", en: "Import / Export", ar: "الاستيراد والتصدير" },
      { value: "Supply Chain Management", en: "Supply Chain Management", ar: "إدارة سلاسل الإمداد" },
      { value: "Customs & Trade Compliance", en: "Customs & Trade Compliance", ar: "الجمارك والامتثال التجاري" },
      { value: "Freight & Transportation", en: "Freight & Transportation", ar: "الشحن والنقل" },
    ],
  },
  {
    value: "Agriculture & Food Security",
    en: "Agriculture & Food Security",
    ar: "الزراعة والأمن الغذائي",
    subs: [
      { value: "Agribusiness", en: "Agribusiness", ar: "الأعمال الزراعية" },
      { value: "Food Processing", en: "Food Processing", ar: "الصناعات الغذائية" },
      { value: "Water & Irrigation", en: "Water & Irrigation", ar: "المياه والري" },
      { value: "Sustainability", en: "Sustainability", ar: "الاستدامة" },
    ],
  },
  {
    value: "Education & Research",
    en: "Education & Research",
    ar: "التعليم والبحث العلمي",
    subs: [
      { value: "Higher Education", en: "Higher Education", ar: "التعليم العالي" },
      { value: "Scientific Research & R&D", en: "Scientific Research & R&D", ar: "البحث العلمي والتطوير" },
      { value: "STEM Education", en: "STEM Education", ar: "تعليم العلوم والتكنولوجيا" },
      { value: "Academic Partnerships", en: "Academic Partnerships", ar: "الشراكات الأكاديمية" },
    ],
  },
  {
    value: "Real Estate & Infrastructure",
    en: "Real Estate & Infrastructure",
    ar: "العقارات والبنية التحتية",
    subs: [
      { value: "Real Estate Development", en: "Real Estate Development", ar: "التطوير العقاري" },
      { value: "Civil Engineering", en: "Civil Engineering", ar: "الهندسة المدنية" },
      { value: "Construction Management", en: "Construction Management", ar: "إدارة البناء" },
      { value: "Urban Planning & Architecture", en: "Urban Planning & Architecture", ar: "التخطيط العمراني والعمارة" },
    ],
  },
  {
    value: "Media & Communications",
    en: "Media & Communications",
    ar: "الإعلام والاتصال",
    subs: [
      { value: "Public Relations", en: "Public Relations", ar: "العلاقات العامة" },
      { value: "Digital Marketing", en: "Digital Marketing", ar: "التسويق الرقمي" },
      { value: "Journalism & Content", en: "Journalism & Content", ar: "الصحافة والمحتوى" },
      { value: "Creative & Design", en: "Creative & Design", ar: "الإبداع والتصميم" },
    ],
  },
  {
    value: "Entrepreneurship & Startups",
    en: "Entrepreneurship & Startups",
    ar: "ريادة الأعمال والشركات الناشئة",
    subs: [
      { value: "Startup Founding & Scaling", en: "Startup Founding & Scaling", ar: "تأسيس الشركات الناشئة وتنميتها" },
      { value: "Small Business Management", en: "Small Business Management", ar: "إدارة الأعمال الصغيرة" },
      { value: "Mentorship & Acceleration", en: "Mentorship & Acceleration", ar: "الإرشاد والاحتضان" },
      { value: "Franchising", en: "Franchising", ar: "الامتياز التجاري" },
    ],
  },
];

export function domainLabel(value: string, locale: "en" | "ar") {
  const domain = EXPERT_DOMAINS.find((d) => d.value === value);
  return domain ? domain[locale] : value;
}

export function subdomainLabel(domainValue: string, value: string, locale: "en" | "ar") {
  const domain = EXPERT_DOMAINS.find((d) => d.value === domainValue);
  const sub = domain?.subs.find((s) => s.value === value);
  return sub ? sub[locale] : value;
}
