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
      // The one path we print on QR codes. The signup flag opens the mailing
      // list dialog on arrival, and loc records which event the scan came
      // from, so point loc at whatever is running when the code goes out.
      // Kept temporary on purpose: a permanent redirect sticks in browser
      // caches, and the whole point of a short fixed path is that the
      // destination can change without reprinting anything.
      {
        source: "/qr",
        destination: "/?loc=club-fair&signup=1",
        permanent: false,
      },
      // The club fair code was printed as /qr-club-fair before the path was
      // shortened. Kept alive so anything already out there still lands.
      {
        source: "/qr-club-fair",
        destination: "/?loc=club-fair&signup=1",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
