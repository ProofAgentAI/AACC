export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
};

export const posts: Post[] = [
  {
    slug: "why-algerian-american-businesses-need-a-chamber",
    title: "Why Algerian-American Businesses Need a Chamber",
    excerpt:
      "Algerian-American businesses are growing across the United States, but without a structured chamber, their collective economic voice remains fragmented. Here's why that's changing.",
    date: "June 18, 2026",
    category: "Chamber Updates",
    readTime: "6 min read",
    featured: true,
  },
  {
    slug: "building-trade-bridges-algeria-united-states",
    title: "Building Trade Bridges Between Algeria and the United States",
    excerpt:
      "From energy and agriculture to technology and services, the U.S.–Algeria trade relationship holds untapped potential. A look at the sectors where bridges are being built.",
    date: "June 4, 2026",
    category: "Market Insights",
    readTime: "8 min read",
  },
  {
    slug: "how-diaspora-entrepreneurs-can-invest-in-algeria",
    title: "How Diaspora Entrepreneurs Can Invest in Algeria",
    excerpt:
      "A practical primer for U.S.-based Algerian entrepreneurs exploring investment back home: sectors, structures, and the questions to ask before you start.",
    date: "May 22, 2026",
    category: "Market Insights",
    readTime: "7 min read",
  },
  {
    slug: "us-algeria-technology-corridor",
    title: "Building a U.S.-Algeria Technology Corridor",
    excerpt:
      "Technology transfer, innovation partnerships, and diaspora expertise are the fastest bridge between the two economies. What the corridor could look like.",
    date: "May 8, 2026",
    category: "Advocacy",
    readTime: "5 min read",
  },
  {
    slug: "meet-the-founding-members-of-aacc-usa",
    title: "Meet the Founding Members of AACC-USA",
    excerpt:
      "Entrepreneurs, executives, physicians, engineers, and community builders: meet the early leaders shaping the Algerian American Chamber of Commerce USA.",
    date: "April 25, 2026",
    category: "Member Spotlights",
    readTime: "4 min read",
  },
];

export const podcastEpisodes = [
  {
    title: "From Algiers to Silicon Valley: A Founder's Journey",
    guest: "Tech Entrepreneur & Founding Member",
    duration: "42 min",
    episode: "Episode 3",
  },
  {
    title: "Financing Cross-Border Trade",
    guest: "International Banking Executive",
    duration: "38 min",
    episode: "Episode 2",
  },
  {
    title: "Why We're Building AACC-USA",
    guest: "AACC-USA Founding Team",
    duration: "35 min",
    episode: "Episode 1",
  },
];
