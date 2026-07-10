// Resolve the site's public URL for canonical links and social share metadata.
// Priority: explicit NEXT_PUBLIC_SITE_URL (set this to https://aacc-usa.org once
// the domain is assigned) > the host Vercel assigns to the deployment > localhost.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
