import type { LeadStatus, Prisma } from "@prisma/client";

import { normalizePhone } from "@/lib/leads/normalize-ingest";
import type { LeadIngestInput, LeadListFilters, LeadStats } from "@/lib/leads/types";
import { prisma } from "@/lib/prisma";

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function listLeads(filters: LeadListFilters = {}) {
  const where: Prisma.LeadWhereInput = {};

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.source && filters.source !== "all") {
    where.source = filters.source;
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { businessName: { contains: q, mode: "insensitive" } },
      { source: { contains: q, mode: "insensitive" } },
      { campaign: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 200,
      skip: filters.offset ?? 0,
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total };
}

export async function getLeadStats(): Promise<LeadStats> {
  const today = startOfToday();

  const [total, todayCount, statusGroups, sourceGroups] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: today } } }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      _count: { _all: true },
    }),
  ]);

  const statusCount = Object.fromEntries(
    statusGroups.map((group) => [group.status, group._count._all]),
  ) as Partial<Record<LeadStatus, number>>;

  return {
    total,
    today: todayCount,
    new: statusCount.NEW ?? 0,
    qualified: statusCount.QUALIFIED ?? 0,
    duplicate: statusCount.DUPLICATE ?? 0,
    bySource: sourceGroups
      .filter((group) => group.source)
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 6)
      .map((group) => ({
        source: group.source as string,
        count: group._count._all,
      })),
  };
}

async function findExistingLead(input: LeadIngestInput) {
  if (input.ghlContactId) {
    const byGhl = await prisma.lead.findUnique({ where: { ghlContactId: input.ghlContactId } });
    if (byGhl) return byGhl;
  }

  if (input.externalId) {
    const byExternal = await prisma.lead.findUnique({ where: { externalId: input.externalId } });
    if (byExternal) return byExternal;
  }

  const phone = normalizePhone(input.phone);
  const orConditions: Prisma.LeadWhereInput[] = [];

  if (input.email) {
    orConditions.push({ email: input.email.toLowerCase() });
  }
  if (phone) {
    orConditions.push({ phone: { contains: phone.slice(-10) } });
  }

  if (orConditions.length === 0) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return prisma.lead.findFirst({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      OR: orConditions,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function ingestLead(input: LeadIngestInput) {
  const email = input.email?.toLowerCase() ?? null;
  const phone = normalizePhone(input.phone);
  const existing = await findExistingLead(input);

  const data: Prisma.LeadCreateInput = {
    externalId: input.externalId ?? undefined,
    ghlContactId: input.ghlContactId ?? undefined,
    firstName: input.firstName ?? undefined,
    lastName: input.lastName ?? undefined,
    fullName: input.fullName ?? undefined,
    email: email ?? undefined,
    phone: phone ?? input.phone ?? undefined,
    businessName: input.businessName ?? undefined,
    source: input.source ?? undefined,
    campaign: input.campaign ?? undefined,
    adSet: input.adSet ?? undefined,
    ad: input.ad ?? undefined,
    owner: input.owner ?? undefined,
    notes: input.notes ?? undefined,
    metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
  };

  if (existing) {
    if (existing.ghlContactId && input.ghlContactId === existing.ghlContactId) {
      return prisma.lead.update({
        where: { id: existing.id },
        data: {
          ...data,
          status: existing.status === "DUPLICATE" ? "DUPLICATE" : existing.status,
        },
      });
    }

    return prisma.lead.create({
      data: {
        ...data,
        status: "DUPLICATE",
      },
    });
  }

  return prisma.lead.create({
    data: {
      ...data,
      status: "NEW",
    },
  });
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return prisma.lead.update({
    where: { id },
    data: { status },
  });
}

export async function getLeadSources(): Promise<string[]> {
  const groups = await prisma.lead.groupBy({
    by: ["source"],
    where: { source: { not: null } },
    orderBy: { source: "asc" },
  });

  return groups
    .map((group) => group.source)
    .filter((source): source is string => Boolean(source));
}
