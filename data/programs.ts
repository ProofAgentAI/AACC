export type Program = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  cta: string;
};

export const programs: Program[] = [
  {
    slug: "trade-missions",
    title: "Trade Missions",
    description:
      "Organized business delegations between the United States and Algeria, connecting companies, investors, and institutions with vetted opportunities on both sides of the Atlantic.",
    icon: "plane",
    cta: "Join a Delegation",
  },
  {
    slug: "algeria-market-access",
    title: "Algeria Market Access",
    description:
      "Helping U.S.-based Algerian-American entrepreneurs and companies understand and evaluate opportunities in Algeria — from market entry to local partnerships.",
    icon: "globe",
    cta: "Explore Algeria",
  },
  {
    slug: "us-market-access",
    title: "U.S. Market Access",
    description:
      "Supporting Algerian companies as they explore U.S. partnerships, distribution channels, and market exposure through chamber introductions and guidance.",
    icon: "building",
    cta: "Enter the U.S. Market",
  },
  {
    slug: "investment-forums",
    title: "Investment Forums",
    description:
      "Curated events around startups, real estate, technology, energy, agriculture, and services — connecting capital with credible cross-border opportunities.",
    icon: "chart",
    cta: "Attend a Forum",
  },
  {
    slug: "direct-flight-advocacy",
    title: "Direct Flight Advocacy Initiative",
    description:
      "Building the business and community case for improved air connectivity between the United States and Algeria — a catalyst for trade, tourism, and family ties.",
    icon: "plane",
    cta: "Support the Initiative",
  },
  {
    slug: "diaspora-business-podcast",
    title: "Diaspora Business Podcast",
    description:
      "Interviews with entrepreneurs, investors, public leaders, and community voices shaping the Algerian-American economic story.",
    icon: "mic",
    cta: "Listen & Participate",
  },
  {
    slug: "youth-professional-development",
    title: "Youth & Professional Development",
    description:
      "Mentorship, career programming, and leadership pathways for students, young professionals, founders, and emerging Algerian-American leaders.",
    icon: "users",
    cta: "Get Involved",
  },
  {
    slug: "women-in-business",
    title: "Women in Business",
    description:
      "Championing Algerian-American women entrepreneurs and executives through visibility, networking, and dedicated programming.",
    icon: "briefcase",
    cta: "Join the Network",
  },
];
