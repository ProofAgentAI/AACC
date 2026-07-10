export type ChamberEvent = {
  slug: string;
  title: string;
  date: string;
  location: string;
  isVirtual: boolean;
  description: string;
  category: string;
};

export const upcomingEvents: ChamberEvent[] = [
  {
    slug: "founding-members-roundtable",
    title: "Founding Members Roundtable",
    date: "September 12, 2026",
    location: "Virtual",
    isVirtual: true,
    description:
      "An invitation-style working session for founding members, advisors, and early sponsors to shape the chamber's first-year priorities and programs.",
    category: "Roundtable",
  },
  {
    slug: "algerian-american-business-summit",
    title: "Algerian-American Business Summit",
    date: "October 24, 2026",
    location: "New York, NY",
    isVirtual: false,
    description:
      "The flagship gathering of Algerian-American entrepreneurs, professionals, investors, and institutional partners — panels, networking, and partnership announcements.",
    category: "Summit",
  },
  {
    slug: "algeria-investment-briefing",
    title: "Algeria Investment Briefing",
    date: "November 6, 2026",
    location: "Washington, DC",
    isVirtual: false,
    description:
      "A focused briefing on investment sectors, market conditions, and partnership pathways in Algeria for U.S.-based investors and business leaders.",
    category: "Briefing",
  },
  {
    slug: "export-import-workshop",
    title: "Export/Import Workshop",
    date: "November 20, 2026",
    location: "Virtual",
    isVirtual: true,
    description:
      "A practical workshop on trade logistics, compliance, documentation, and financing for companies trading between the U.S. and Algeria.",
    category: "Workshop",
  },
  {
    slug: "diaspora-leadership-podcast-live",
    title: "Diaspora Leadership Podcast Live",
    date: "December 10, 2026",
    location: "Chicago, IL",
    isVirtual: false,
    description:
      "A live recording of the Diaspora Business Podcast featuring Algerian-American founders and community leaders, followed by open networking.",
    category: "Podcast",
  },
];
