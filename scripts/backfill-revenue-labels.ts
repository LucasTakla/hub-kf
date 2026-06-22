import { applyStandardLeadRevenue } from "../lib/leads/revenue-labels";
import { prisma } from "../lib/prisma";

async function main() {
  const batchSize = 500;
  let cursor: string | undefined;
  let updated = 0;
  let scanned = 0;

  for (;;) {
    const leads = await prisma.lead.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        monthlyRevenue: true,
        monthlyRevenueLabel: true,
        metadata: true,
      },
    });

    if (leads.length === 0) break;

    for (const lead of leads) {
      scanned += 1;
      const revenue = applyStandardLeadRevenue(lead);
      if (!revenue.monthlyRevenueLabel && revenue.monthlyRevenue == null) continue;
      if (
        lead.monthlyRevenueLabel === revenue.monthlyRevenueLabel &&
        lead.monthlyRevenue === revenue.monthlyRevenue
      ) {
        continue;
      }

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          monthlyRevenueLabel: revenue.monthlyRevenueLabel,
          monthlyRevenue: revenue.monthlyRevenue,
        },
      });
      updated += 1;
    }

    cursor = leads[leads.length - 1]?.id;
    console.log(`Scanned ${scanned}, updated ${updated}...`);
  }

  console.log(`Done. Updated ${updated} of ${scanned} leads.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
