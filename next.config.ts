import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/tasks", destination: "/productivity?tab=plans", permanent: false },
      { source: "/goals", destination: "/productivity?tab=goals", permanent: false },
      { source: "/habits", destination: "/productivity?tab=habits", permanent: false },
      {
        source: "/daily-reviews",
        destination: "/productivity?tab=reviews",
        permanent: false,
      },
      { source: "/learning", destination: "/growth?tab=learning", permanent: false },
      { source: "/english", destination: "/growth?tab=english", permanent: false },
      { source: "/finance", destination: "/life?tab=finance", permanent: false },
      { source: "/spiritual", destination: "/life?tab=spiritual", permanent: false },
      { source: "/health", destination: "/life?tab=health", permanent: false },
      { source: "/journal", destination: "/life?tab=journal", permanent: false },
      { source: "/analytics", destination: "/insights?tab=analytics", permanent: false },
      {
        source: "/activity-logs",
        destination: "/insights?tab=activity",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
