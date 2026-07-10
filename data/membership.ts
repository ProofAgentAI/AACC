export type MembershipTier = {
  slug: string;
  name: string;
  price: string;
  period: string;
  audience: string;
  benefits: string[];
  featured?: boolean;
  cta: string;
};

export const membershipTiers: MembershipTier[] = [
  {
    slug: "individual",
    name: "Individual Member",
    price: "$95",
    period: "/year",
    audience: "For professionals, founders, students, and community leaders.",
    benefits: [
      "Member newsletter and market insights",
      "Access to chamber events and programs",
      "Member network and community access",
      "Podcast participation opportunities",
    ],
    cta: "Join as an Individual",
  },
  {
    slug: "business",
    name: "Business Member",
    price: "$295",
    period: "/year",
    audience: "For small businesses, startups, service providers, and entrepreneurs.",
    benefits: [
      "Business directory listing",
      "Event discounts and priority registration",
      "B2B introductions within the network",
      "Member spotlight opportunities",
    ],
    featured: true,
    cta: "Join as a Business",
  },
  {
    slug: "corporate",
    name: "Corporate Partner",
    price: "$1,500",
    period: "/year",
    audience: "For corporations, banks, airlines, universities, and institutions.",
    benefits: [
      "Sponsorship placement across chamber platforms",
      "Speaking opportunities at events and forums",
      "Strategic introductions and partnership support",
      "Institutional visibility in both markets",
    ],
    cta: "Become a Corporate Partner",
  },
  {
    slug: "founding-sponsor",
    name: "Founding Sponsor",
    price: "$5,000",
    period: " founding commitment",
    audience: "For early supporters who want visibility and legacy positioning.",
    benefits: [
      "Homepage and event recognition",
      "Founding sponsor certificate",
      "VIP access to summits and roundtables",
      "Advisory access to chamber leadership",
    ],
    cta: "Become a Founding Sponsor",
  },
];

export const memberBenefits = [
  {
    title: "Directory Visibility",
    description: "A professional presence in the Algerian-American business directory, visible to partners in both markets.",
    icon: "building",
  },
  {
    title: "Professional Networking",
    description: "Connect with Algerian-American professionals, founders, and executives across the United States.",
    icon: "users",
  },
  {
    title: "Events & Roundtables",
    description: "Access to summits, investment briefings, workshops, and member-only roundtables.",
    icon: "calendar",
  },
  {
    title: "Trade & Investment Insights",
    description: "Market intelligence and practical guidance on U.S.–Algeria trade and investment opportunities.",
    icon: "chart",
  },
  {
    title: "Sponsorship Opportunities",
    description: "Position your organization in front of a growing cross-border business audience.",
    icon: "shield",
  },
  {
    title: "Business Introductions",
    description: "Warm introductions to members, partners, and institutions aligned with your goals.",
    icon: "handshake",
  },
  {
    title: "Community Leadership",
    description: "Shape programs and advocacy priorities as part of the chamber's founding network.",
    icon: "globe",
  },
];
