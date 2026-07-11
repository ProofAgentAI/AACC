export type DirectoryListing = {
  slug: string;
  name: string;
  category: string;
  businessType: string;
  city: string;
  state: string;
  description: string;
  website: string;
  services: string[];
  algeriaInterest: boolean;
  usInterest: boolean;
  initials: string;
  logoUrl?: string;
};

export const industries = [
  "Technology Consulting",
  "Import/Export",
  "Food & Hospitality",
  "Real Estate",
  "Legal Services",
  "Healthcare",
  "Education",
  "Logistics",
];

export const states = ["NY", "NJ", "CA", "TX", "IL", "VA", "FL", "MA"];

export const businessTypes = [
  "Consulting Firm",
  "Trading Company",
  "Restaurant Group",
  "Agency",
  "Law Firm",
  "Medical Practice",
  "Institute",
  "Freight Company",
];

export const directoryListings: DirectoryListing[] = [
  {
    slug: "atlas-tech-partners",
    name: "Atlas Tech Partners",
    category: "Technology Consulting",
    businessType: "Consulting Firm",
    city: "New York",
    state: "NY",
    description:
      "Software engineering and digital transformation consultancy serving U.S. enterprises, with delivery partnerships in Algiers and Oran.",
    website: "atlastechpartners.example.com",
    services: ["Software Development", "Cloud Migration", "IT Strategy"],
    algeriaInterest: true,
    usInterest: true,
    initials: "AT",
  },
  {
    slug: "sahara-trade-group",
    name: "Sahara Trade Group",
    category: "Import/Export",
    businessType: "Trading Company",
    city: "Newark",
    state: "NJ",
    description:
      "Import/export company specializing in Algerian dates, olive oil, and artisanal goods for U.S. retail and wholesale distribution.",
    website: "saharatradegroup.example.com",
    services: ["Import/Export", "Distribution", "Sourcing"],
    algeriaInterest: true,
    usInterest: true,
    initials: "ST",
  },
  {
    slug: "casbah-kitchen-hospitality",
    name: "Casbah Kitchen Hospitality",
    category: "Food & Hospitality",
    businessType: "Restaurant Group",
    city: "San Francisco",
    state: "CA",
    description:
      "Restaurant group bringing Algerian and North African cuisine to the U.S. market, with catering and franchise development services.",
    website: "casbahkitchen.example.com",
    services: ["Restaurants", "Catering", "Franchising"],
    algeriaInterest: false,
    usInterest: true,
    initials: "CK",
  },
  {
    slug: "numidia-realty-advisors",
    name: "Numidia Realty Advisors",
    category: "Real Estate",
    businessType: "Agency",
    city: "Houston",
    state: "TX",
    description:
      "Commercial and residential real estate advisory for diaspora investors, including cross-border property investment guidance.",
    website: "numidiarealty.example.com",
    services: ["Brokerage", "Investment Advisory", "Property Management"],
    algeriaInterest: true,
    usInterest: true,
    initials: "NR",
  },
  {
    slug: "hoggar-law-group",
    name: "Hoggar Law Group",
    category: "Legal Services",
    businessType: "Law Firm",
    city: "Chicago",
    state: "IL",
    description:
      "Business immigration, corporate formation, and cross-border transaction counsel for Algerian-American entrepreneurs and companies.",
    website: "hoggarlaw.example.com",
    services: ["Immigration", "Corporate Law", "Contracts"],
    algeriaInterest: true,
    usInterest: true,
    initials: "HL",
  },
  {
    slug: "tell-health-clinic",
    name: "Tell Health Clinic",
    category: "Healthcare",
    businessType: "Medical Practice",
    city: "Arlington",
    state: "VA",
    description:
      "Multilingual family medicine and telehealth practice serving the Algerian-American community in the greater DC area.",
    website: "tellhealth.example.com",
    services: ["Family Medicine", "Telehealth", "Community Health"],
    algeriaInterest: false,
    usInterest: true,
    initials: "TH",
  },
  {
    slug: "zirid-language-institute",
    name: "Zirid Language Institute",
    category: "Education",
    businessType: "Institute",
    city: "Miami",
    state: "FL",
    description:
      "Language education and professional training institute offering Arabic, French, and English programs plus corporate training.",
    website: "ziridinstitute.example.com",
    services: ["Language Programs", "Corporate Training", "Test Prep"],
    algeriaInterest: true,
    usInterest: false,
    initials: "ZL",
  },
  {
    slug: "mediterranean-freight-solutions",
    name: "Mediterranean Freight Solutions",
    category: "Logistics",
    businessType: "Freight Company",
    city: "Boston",
    state: "MA",
    description:
      "Freight forwarding and logistics services across the Atlantic and Mediterranean, with expertise in U.S.–Algeria shipping lanes.",
    website: "medfreight.example.com",
    services: ["Freight Forwarding", "Customs Brokerage", "Warehousing"],
    algeriaInterest: true,
    usInterest: true,
    initials: "MF",
  },
];
