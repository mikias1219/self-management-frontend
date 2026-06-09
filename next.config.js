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
      { source: "/", destination: "/today", permanent: false },
      { source: "/tasks", destination: "/productivity?tab=tasks", permanent: false },
      { source: "/goals", destination: "/productivity?tab=goals", permanent: false },
      { source: "/habits", destination: "/productivity?tab=habits", permanent: false },
      { source: "/daily-reviews", destination: "/today#review", permanent: false },
      { source: "/productivity/tasks", destination: "/productivity?tab=tasks", permanent: false },
      { source: "/productivity/goals", destination: "/productivity?tab=goals", permanent: false },
      { source: "/productivity/habits", destination: "/productivity?tab=habits", permanent: false },
      { source: "/productivity/review", destination: "/today#review", permanent: false },
      { source: "/productivity/today", destination: "/today", permanent: false },
      { source: "/productivity", has: [{ type: "query", key: "tab", value: "today" }], destination: "/today", permanent: false },
      { source: "/productivity", has: [{ type: "query", key: "tab", value: "review" }], destination: "/today#review", permanent: false },
      { source: "/productivity", has: [{ type: "query", key: "tab", value: "progress" }], destination: "/productivity?tab=tasks", permanent: false },
      { source: "/learning", destination: "/growth?tab=learning", permanent: false },
      { source: "/english", destination: "/growth?tab=learning", permanent: false },
      { source: "/life", destination: "/finance", permanent: false },
      { source: "/life/finance", destination: "/finance", permanent: false },
      { source: "/spiritual", destination: "/growth?tab=wellbeing", permanent: false },
      { source: "/health", destination: "/growth?tab=health", permanent: false },
      { source: "/journal", destination: "/growth?tab=wellbeing", permanent: false },
      { source: "/analytics", destination: "/insights", permanent: false },
      { source: "/activity-logs", destination: "/insights?tab=activity", permanent: false },
      { source: "/dashboard", destination: "/today", permanent: false },
    ];
  },
};

module.exports = nextConfig;
