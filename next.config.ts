import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/overview", permanent: true },
      { source: "/leads", destination: "/sales/pipeline", permanent: true },
      { source: "/sales/leads", destination: "/sales/pipeline", permanent: true },
      { source: "/sales/deals", destination: "/sales/pipeline", permanent: true },
      { source: "/ads", destination: "/marketing/campaigns", permanent: true },
      { source: "/marketing", destination: "/marketing/campaigns", permanent: true },
      { source: "/email", destination: "/marketing/copy-lab", permanent: true },
      { source: "/growth", destination: "/marketing/analytics", permanent: true },
      { source: "/finance", destination: "/executive/financials", permanent: true },
      { source: "/executive/company-overview", destination: "/executive/overview", permanent: true },
      { source: "/executive/revenue", destination: "/executive/financials", permanent: true },
      { source: "/executive/expenses", destination: "/executive/financials", permanent: true },
      { source: "/executive/commissions", destination: "/executive/financials", permanent: true },
      { source: "/executive/forecasting", destination: "/executive/financials", permanent: true },
      { source: "/executive/kpis", destination: "/executive/overview", permanent: true },
      { source: "/executive", destination: "/executive/overview", permanent: false },
    ];
  },
};

export default nextConfig;
