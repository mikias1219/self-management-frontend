/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: "/tasks", destination: "/productivity?tab=tasks", permanent: false },
      { source: "/goals", destination: "/productivity?tab=goals", permanent: false },
      { source: "/habits", destination: "/productivity?tab=habits", permanent: false },
      { source: "/daily-reviews", destination: "/#review", permanent: false },
      { source: "/productivity/tasks", destination: "/productivity?tab=tasks", permanent: false },
      { source: "/productivity/goals", destination: "/productivity?tab=goals", permanent: false },
      { source: "/productivity/habits", destination: "/productivity?tab=habits", permanent: false },
      { source: "/productivity/review", destination: "/#review", permanent: false },
      { source: "/productivity/today", destination: "/", permanent: false },
      { source: "/productivity", has: [{ type: "query", key: "tab", value: "today" }], destination: "/", permanent: false },
      { source: "/productivity", has: [{ type: "query", key: "tab", value: "review" }], destination: "/#review", permanent: false },
      { source: "/productivity", has: [{ type: "query", key: "tab", value: "progress" }], destination: "/productivity?tab=tasks", permanent: false },
      { source: "/learning", destination: "/life?tab=learning", permanent: false },
      { source: "/english", destination: "/life?tab=english", permanent: false },
      { source: "/spiritual", destination: "/life?tab=spiritual", permanent: false },
      { source: "/health", destination: "/life?tab=health", permanent: false },
      { source: "/journal", destination: "/life?tab=journal", permanent: false },
      { source: "/analytics", destination: "/insights", permanent: false },
      { source: "/activity-logs", destination: "/insights?tab=activity", permanent: false },
      { source: "/dashboard", destination: "/", permanent: false },
      { source: "/today", destination: "/", permanent: false },
      { source: "/more", destination: "/insights", permanent: false },
      { source: "/growth", destination: "/life?tab=learning", permanent: false },
    ];
  },
};

module.exports = nextConfig;
