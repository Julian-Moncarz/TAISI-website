import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The intensive moved from /summer-intensive to /intensive. Keep the old
      // paths working for posters, emails, and anything already shared.
      {
        source: "/summer-intensive",
        destination: "/intensive",
        permanent: true,
      },
      {
        source: "/summer-intensive/:path*",
        destination: "/intensive/:path*",
        permanent: true,
      },
      // Printed QR codes point at a short path rather than the home page, so
      // the destination can change later without reprinting anything. Kept
      // temporary on purpose: a permanent redirect sticks in browser caches.
      // The signup flag opens the mailing list dialog on arrival, and loc
      // records where the scan came from.
      {
        source: "/qr-club-fair",
        destination: "/?loc=club-fair&signup=1",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
