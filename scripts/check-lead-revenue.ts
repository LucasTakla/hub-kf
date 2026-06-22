import { prisma } from "../lib/prisma";

async function main() {
  const cols = await prisma.$queryRaw<
    Array<{ column_name: string; data_type: string }>
  >`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Lead'
    ORDER BY ordinal_position
  `;
  console.log("Lead columns:", cols.map((c) => c.column_name).join(", "));

  const counts = await prisma.$queryRaw<
    Array<{ total: number; with_revenue: number; with_label: number }>
  >`
    SELECT
      COUNT(*)::int AS total,
      COUNT("monthlyRevenue")::int AS with_revenue,
      COUNT("monthlyRevenueLabel")::int AS with_label
    FROM "Lead"
  `;
  console.log("Counts:", counts[0]);

  const sample = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      monthlyRevenue: true,
      monthlyRevenueLabel: true,
      metadata: true,
    },
  });
  console.log("Recent leads:", JSON.stringify(sample, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
