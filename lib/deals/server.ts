import type { Prisma } from "@prisma/client";

import { mapDealToClient } from "@/lib/deals/mappers";
import { normalizePhone } from "@/lib/leads/normalize-ingest";
import type {
  ApplicationInput,
  ApplicationUpdateInput,
  DealListFilters,
  DealSyncInput,
  OfferInput,
  OfferUpdateInput,
} from "@/lib/deals/types";
import type { Deal } from "@/lib/sales/types";
import { prisma } from "@/lib/prisma";

const dealInclude = {
  applications: { orderBy: { createdAt: "desc" as const } },
  offers: { orderBy: { createdAt: "desc" as const } },
};

export async function listDeals(filters: DealListFilters = {}): Promise<{
  items: Deal[];
  total: number;
}> {
  const where: Prisma.DealWhereInput = {};

  if (filters.stage && filters.stage !== "all") {
    where.stage = filters.stage;
  }
  if (filters.owner?.trim()) {
    where.owner = { contains: filters.owner.trim(), mode: "insensitive" };
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { owner: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { contactPhone: { contains: q, mode: "insensitive" } },
      { ghlStageName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: dealInclude,
      orderBy: { updatedAt: "desc" },
      take: filters.limit ?? 200,
      skip: filters.offset ?? 0,
    }),
    prisma.deal.count({ where }),
  ]);

  return {
    items: items.map(mapDealToClient),
    total,
  };
}

export async function getDealById(id: string): Promise<Deal | null> {
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: dealInclude,
  });
  return deal ? mapDealToClient(deal) : null;
}

async function linkLeadForDeal(input: DealSyncInput): Promise<string | null> {
  let lead = input.ghlContactId
    ? await prisma.lead.findUnique({ where: { ghlContactId: input.ghlContactId } })
    : null;

  if (!lead && input.contactEmail) {
    lead = await prisma.lead.findFirst({
      where: { email: input.contactEmail.toLowerCase() },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!lead && input.contactPhone) {
    const digits = normalizePhone(input.contactPhone);
    if (digits) {
      const candidates = await prisma.lead.findMany({
        where: { phone: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 500,
      });
      lead =
        candidates.find((item) => normalizePhone(item.phone) === digits) ?? null;
    }
  }

  if (!lead) return null;

  const updates: { status?: "CONVERTED"; ghlContactId?: string } = {};
  if (lead.status !== "CONVERTED") updates.status = "CONVERTED";
  if (input.ghlContactId && !lead.ghlContactId) updates.ghlContactId = input.ghlContactId;

  if (Object.keys(updates).length > 0) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: updates,
    });
  }

  return lead.id;
}

async function resolveBusinessNameForCreate(
  input: DealSyncInput,
  leadId: string | null,
): Promise<string> {
  if (input.businessName?.trim()) return input.businessName.trim();
  if (input.contactName?.trim()) return input.contactName.trim();

  if (leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (lead?.businessName?.trim()) return lead.businessName.trim();
    if (lead?.fullName?.trim()) return lead.fullName.trim();
  }

  return `GHL deal ${input.ghlOpportunityId.slice(0, 8)}`;
}

export async function syncDealFromGhl(input: DealSyncInput) {
  const existing = await prisma.deal.findUnique({
    where: { ghlOpportunityId: input.ghlOpportunityId },
  });

  if (input.action === "stage-changed" && !existing) {
    throw new Error(
      `Deal not found for ghlOpportunityId ${input.ghlOpportunityId}. Send action "opportunity-created" first.`,
    );
  }

  const leadId =
    existing?.leadId ??
    (input.skipLeadLink ? null : await linkLeadForDeal(input));
  const stage = input.stage ?? existing?.stage ?? "NEW";
  const stageChanged = existing ? existing.stage !== stage : true;

  if (existing) {
    const deal = await prisma.deal.update({
      where: { ghlOpportunityId: input.ghlOpportunityId },
      data: {
        ...(input.ghlContactId ? { ghlContactId: input.ghlContactId } : {}),
        ...(input.ghlStageName ? { ghlStageName: input.ghlStageName } : {}),
        ...(leadId && !existing.leadId ? { leadId } : {}),
        ...(input.businessName?.trim() ? { businessName: input.businessName.trim() } : {}),
        ...(input.fundingAmount != null ? { fundingAmount: input.fundingAmount } : {}),
        ...(input.fundedAmount != null ? { fundedAmount: input.fundedAmount } : {}),
        ...(input.owner ? { owner: input.owner } : {}),
        stage,
        ...(stageChanged ? { stageEnteredAt: new Date() } : {}),
        ...(input.priority ? { priority: input.priority } : {}),
        lastActivity: input.ghlStageName ?? input.lastActivity ?? existing.lastActivity,
        ...(input.industry ? { industry: input.industry } : {}),
        ...(input.annualRevenue != null ? { annualRevenue: input.annualRevenue } : {}),
        ...(input.contactName ? { contactName: input.contactName } : {}),
        ...(input.contactEmail ? { contactEmail: input.contactEmail } : {}),
        ...(input.contactPhone ? { contactPhone: input.contactPhone } : {}),
        ...(input.source ? { source: input.source } : {}),
        ...(input.internalNotes ? { internalNotes: input.internalNotes } : {}),
        ...(input.createdAt ? { createdAt: input.createdAt } : {}),
        ...(input.metadata
          ? { metadata: input.metadata as Prisma.InputJsonValue }
          : {}),
        syncedAt: new Date(),
      },
      include: dealInclude,
    });

    return mapDealToClient(deal);
  }

  const businessName = await resolveBusinessNameForCreate(input, leadId);
  const createdAt = input.createdAt ?? new Date();

  const deal = await prisma.deal.create({
    data: {
      ghlOpportunityId: input.ghlOpportunityId,
      ghlContactId: input.ghlContactId ?? undefined,
      ghlStageName: input.ghlStageName ?? undefined,
      leadId: leadId ?? undefined,
      businessName,
      fundingAmount: input.fundingAmount ?? 0,
      fundedAmount: input.fundedAmount ?? undefined,
      owner: input.owner ?? undefined,
      stage,
      stageEnteredAt: createdAt,
      priority: input.priority ?? "MEDIUM",
      lastActivity: input.lastActivity ?? input.ghlStageName ?? "Synced from GoHighLevel",
      industry: input.industry ?? undefined,
      annualRevenue: input.annualRevenue ?? undefined,
      contactName: input.contactName ?? undefined,
      contactEmail: input.contactEmail ?? undefined,
      contactPhone: input.contactPhone ?? undefined,
      source: input.source ?? undefined,
      internalNotes: input.internalNotes ?? undefined,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      createdAt,
      syncedAt: new Date(),
    },
    include: dealInclude,
  });

  return mapDealToClient(deal);
}

export async function createApplication(input: ApplicationInput) {
  const deal = await prisma.deal.findUnique({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");

  const app = await prisma.dealApplication.create({
    data: {
      dealId: input.dealId,
      lender: input.lender.trim(),
      status: input.status ?? "DRAFT",
      submissionDate: input.submissionDate ?? (input.status === "SUBMITTED" ? new Date() : null),
      assignedUser: input.assignedUser?.trim() || deal.owner,
      notes: input.notes?.trim() || undefined,
    },
  });

  return app;
}

export async function updateApplication(id: string, input: ApplicationUpdateInput) {
  const existing = await prisma.dealApplication.findUnique({ where: { id } });
  if (!existing) throw new Error("Application not found");

  const nextStatus = input.status ?? existing.status;
  const submissionDate =
    input.submissionDate !== undefined
      ? input.submissionDate
      : nextStatus !== "DRAFT" && !existing.submissionDate
        ? new Date()
        : existing.submissionDate;

  return prisma.dealApplication.update({
    where: { id },
    data: {
      lender: input.lender?.trim(),
      status: input.status,
      submissionDate,
      assignedUser: input.assignedUser === null ? null : input.assignedUser?.trim(),
      notes: input.notes === null ? null : input.notes?.trim(),
    },
  });
}

export async function createOffer(input: OfferInput) {
  const deal = await prisma.deal.findUnique({ where: { id: input.dealId } });
  if (!deal) throw new Error("Deal not found");

  return prisma.dealOffer.create({
    data: {
      dealId: input.dealId,
      lender: input.lender.trim(),
      amount: input.amount,
      factorRate: input.factorRate ?? undefined,
      term: input.term?.trim() || undefined,
      paymentFrequency: input.paymentFrequency?.trim() || undefined,
      status: input.status ?? "RECEIVED",
      expirationDate: input.expirationDate ?? undefined,
      dailyPayment: input.dailyPayment ?? undefined,
      notes: input.notes?.trim() || undefined,
    },
  });
}

export async function updateOffer(id: string, input: OfferUpdateInput) {
  const existing = await prisma.dealOffer.findUnique({ where: { id } });
  if (!existing) throw new Error("Offer not found");

  return prisma.dealOffer.update({
    where: { id },
    data: {
      lender: input.lender?.trim(),
      amount: input.amount,
      factorRate: input.factorRate === null ? null : input.factorRate,
      term: input.term === null ? null : input.term?.trim(),
      paymentFrequency: input.paymentFrequency === null ? null : input.paymentFrequency?.trim(),
      status: input.status,
      expirationDate: input.expirationDate === null ? null : input.expirationDate,
      dailyPayment: input.dailyPayment === null ? null : input.dailyPayment,
      notes: input.notes === null ? null : input.notes?.trim(),
    },
  });
}

export async function getDealStats() {
  const [active, funded, withOffers] = await Promise.all([
    prisma.deal.count({
      where: { stage: { notIn: ["FUNDED", "LOST"] } },
    }),
    prisma.deal.count({ where: { stage: "FUNDED" } }),
    prisma.deal.count({ where: { offers: { some: {} } } }),
  ]);

  const pipelineValue = await prisma.deal.aggregate({
    where: { stage: { notIn: ["FUNDED", "LOST"] } },
    _sum: { fundingAmount: true },
  });

  return {
    active,
    funded,
    withOffers,
    pipelineValue: pipelineValue._sum.fundingAmount ?? 0,
  };
}
