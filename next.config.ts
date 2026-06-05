import type { NextConfig } from "next";
import path from "path";

const frontendRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  /** LifeOS has lockfiles at repo root and in frontend — pin tracing/dev roots here. */
  output: 'standalone',
  outputFileTracingRoot: frontendRoot,
  turbopack: {
    root: frontendRoot,
  },
  async redirects() {
    return [
      { source: "/tasks", destination: "/productivity?tab=tasks", permanent: false },
      { source: "/goals", destination: "/productivity?tab=goals", permanent: false },
      { source: "/habits", destination: "/productivity?tab=habits", permanent: false },
      {
        source: "/daily-reviews",
        destination: "/productivity?tab=review",
        permanent: false,
      },
      {
        source: "/productivity/tasks",
        destination: "/productivity?tab=tasks",
        permanent: false,
      },
      {
        source: "/productivity/goals",
        destination: "/productivity?tab=goals",
        permanent: false,
      },
      {
        source: "/productivity/habits",
        destination: "/productivity?tab=habits",
        permanent: false,
      },
      {
        source: "/productivity/review",
        destination: "/productivity?tab=review",
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
