export type SponsorTier = {
  slug: string;
  name: string;
  price: string;
  description: string;
  benefits: string[];
  featured?: boolean;
};

export const sponsorTiers: SponsorTier[] = [
  {
    slug: "platinum",
    name: "Platinum Sponsor",
    price: "$25,000",
    description: "Flagship partnership with premier visibility across all chamber platforms and events.",
    benefits: [
      "Premier logo placement on homepage and all events",
      "Keynote and speaking opportunities",
      "Dedicated strategic introductions",
      "Advisory board access",
      "Year-round media and podcast presence",
    ],
    featured: true,
  },
  {
    slug: "gold",
    name: "Gold Sponsor",
    price: "$10,000",
    description: "High-visibility partnership across major chamber programs and communications.",
    benefits: [
      "Logo placement on website and major events",
      "Panel and speaking opportunities",
      "Business introductions within the network",
      "Newsletter and media recognition",
    ],
  },
  {
    slug: "silver",
    name: "Silver Sponsor",
    price: "$5,000",
    description: "Strong brand presence at chamber events and in the member network.",
    benefits: [
      "Logo placement at chamber events",
      "Recognition in newsletters",
      "Event tickets and member access",
    ],
  },
  {
    slug: "community",
    name: "Community Sponsor",
    price: "$2,500",
    description: "Support community programming while gaining goodwill and local visibility.",
    benefits: [
      "Recognition in community programs",
      "Newsletter acknowledgment",
      "Event participation",
    ],
  },
  {
    slug: "event",
    name: "Event Sponsor",
    price: "From $1,000",
    description: "Sponsor a single summit, workshop, roundtable, or podcast episode.",
    benefits: [
      "Event-specific branding",
      "On-stage recognition",
      "Attendee networking access",
    ],
  },
];

export const partnerTypes = [
  { name: "Corporations", icon: "building" },
  { name: "Airlines", icon: "plane" },
  { name: "Banks", icon: "chart" },
  { name: "Universities", icon: "users" },
  { name: "Law Firms", icon: "shield" },
  { name: "Consulting Firms", icon: "briefcase" },
  { name: "Government-Adjacent Institutions", icon: "globe" },
  { name: "Nonprofit Organizations", icon: "handshake" },
];
