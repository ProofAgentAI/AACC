/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Team photos, business logos, and post images live in Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
