import {
  ActivityType,
  IntegrationStatus,
  PrismaClient,
  RoadmapConfidence,
  RoadmapPriority,
  RoadmapStage,
  RoadmapStatus,
} from "@prisma/client";

import { buildNavRoadmapSeed } from "@/lib/roadmap/nav-roadmap";

const prisma = new PrismaClient();

const { releases, items: navItems, laneStartDates } = buildNavRoadmapSeed();

type ItemProgress = {
  status: RoadmapStatus;
  stage: RoadmapStage;
  confidence: RoadmapConfidence;
  progress: number;
  priority: RoadmapPriority;
  owner: string;
  team: string;
};

const releaseDefaults: Record<string, Omit<ItemProgress, "progress" | "status" | "stage">> = {
  v1: { confidence: RoadmapConfidence.HIGH, priority: RoadmapPriority.P0, owner: "Lucas Takla", team: "Product" },
  v2: { confidence: RoadmapConfidence.MEDIUM, priority: RoadmapPriority.P0, owner: "Lucas Takla", team: "Product" },
  v3: { confidence: RoadmapConfidence.MEDIUM, priority: RoadmapPriority.P0, owner: "Lucas Takla", team: "Product" },
  v4: { confidence: RoadmapConfidence.MEDIUM, priority: RoadmapPriority.P1, owner: "AI Team", team: "Engineering" },
  v5: { confidence: RoadmapConfidence.MEDIUM, priority: RoadmapPriority.P0, owner: "Lucas Takla", team: "Leadership" },
};

/** Per-item status within the current (v1) release — earlier nav items further along */
const v1ItemProgress: ItemProgress[] = [
  { status: RoadmapStatus.IN_PROGRESS, stage: RoadmapStage.TESTING, progress: 75, ...releaseDefaults.v1 },
  { status: RoadmapStatus.IN_PROGRESS, stage: RoadmapStage.DEVELOPMENT, progress: 55, ...releaseDefaults.v1 },
  { status: RoadmapStatus.IN_PROGRESS, stage: RoadmapStage.DEVELOPMENT, progress: 40, ...releaseDefaults.v1 },
  { status: RoadmapStatus.PLANNED, stage: RoadmapStage.RESEARCH, progress: 15, ...releaseDefaults.v1 },
];

function getItemProgress(lane: string, indexInLane: number): ItemProgress {
  if (lane === "v1" && v1ItemProgress[indexInLane]) {
    return v1ItemProgress[indexInLane]!;
  }

  const defaults = releaseDefaults[lane] ?? releaseDefaults.v4;
  return {
    status: RoadmapStatus.PLANNED,
    stage: RoadmapStage.RESEARCH,
    progress: 0,
    ...defaults,
  };
}

const laneItemCounts: Record<string, number> = {};
const roadmapItems = navItems.map((item) => {
  const indexInLane = laneItemCounts[item.lane] ?? 0;
  laneItemCounts[item.lane] = indexInLane + 1;

  const progress = getItemProgress(item.lane, indexInLane);
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    module: item.module,
    phase: item.phase,
    lane: item.lane,
    priority: progress.priority,
    status: progress.status,
    stage: progress.stage,
    confidence: progress.confidence,
    progress: progress.progress,
    owner: progress.owner,
    team: progress.team,
    targetDate: item.targetDate,
    dependsOnIds: item.dependsOnIds,
    sortOrder: item.sortOrder,
  };
});

const activities: Array<{
  message: string;
  roadmapItemId: string;
  type: ActivityType;
  hoursAgo: number;
}> = [
  { message: "Campaigns workspace entered Testing", roadmapItemId: "nav-v1-campaigns", type: ActivityType.UPDATE, hoursAgo: 2 },
  { message: "Creatives module in active development", roadmapItemId: "nav-v1-creatives", type: ActivityType.UPDATE, hoursAgo: 5 },
  { message: "Copy Lab scoped and wireframes started", roadmapItemId: "nav-v1-copy-lab", type: ActivityType.UPDATE, hoursAgo: 8 },
  { message: "Analytics module added to V1 release", roadmapItemId: "nav-v1-analytics", type: ActivityType.UPDATE, hoursAgo: 12 },
  { message: "V2 Sales release planned for 26 Jun", roadmapItemId: "nav-v2-pipeline", type: ActivityType.UPDATE, hoursAgo: 24 },
  { message: "AI agents module scoped for V4", roadmapItemId: "nav-v4-agents", type: ActivityType.UPDATE, hoursAgo: 36 },
  { message: "Executive section scheduled for V5", roadmapItemId: "nav-v5-overview", type: ActivityType.UPDATE, hoursAgo: 48 },
];

const integrations = [
  {
    slug: "google-sheets",
    name: "Google Sheets",
    description: "Lead lists and manual tracking spreadsheets",
    status: IntegrationStatus.NOT_CONNECTED,
  },
  {
    slug: "adveronix",
    name: "Adveronix",
    description: "Facebook / Meta ads data and reporting",
    status: IntegrationStatus.NOT_CONNECTED,
  },
  {
    slug: "go-high-level",
    name: "Go High Level",
    description: "CRM, pipeline, and automation",
    status: IntegrationStatus.NOT_CONNECTED,
  },
  {
    slug: "meta-ads",
    name: "Meta Ads",
    description: "Direct Meta Marketing API (future)",
    status: IntegrationStatus.NOT_CONNECTED,
  },
  {
    slug: "email-platform",
    name: "Email Platform",
    description: "GHL email or dedicated ESP",
    status: IntegrationStatus.NOT_CONNECTED,
  },
];

async function main() {
  console.log("Seeding Kapital Funding Hub...");

  await prisma.roadmapActivity.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.release.deleteMany();

  for (const release of releases) {
    const { navGroupId: _navGroupId, ...releaseData } = release;
    await prisma.release.create({ data: releaseData });
  }

  for (const item of roadmapItems) {
    await prisma.roadmapItem.create({
      data: {
        ...item,
        startDate: laneStartDates[item.lane] ?? item.targetDate,
      },
    });
  }

  for (const activity of activities) {
    await prisma.roadmapActivity.create({
      data: {
        message: activity.message,
        type: activity.type,
        roadmapItemId: activity.roadmapItemId,
        createdAt: new Date(Date.now() - activity.hoursAgo * 60 * 60 * 1000),
      },
    });
  }

  for (const integration of integrations) {
    await prisma.integration.upsert({
      where: { slug: integration.slug },
      update: integration,
      create: integration,
    });
  }

  await prisma.lead.createMany({
    data: [
      {
        fullName: "Maria Santos",
        email: "maria@sunrisebakery.com",
        phone: "3055550142",
        businessName: "Sunrise Bakery LLC",
        source: "Meta",
        campaign: "SBA Interest Form",
        adSet: "Florida Broad",
        monthlyRevenue: 42000,
        status: "NEW",
      },
      {
        fullName: "James Whitfield",
        email: "james@whitfieldauto.com",
        phone: "4045550198",
        businessName: "Whitfield Auto Repair",
        source: "Meta",
        campaign: "Working Capital EN",
        adSet: "Retargeting 30d",
        monthlyRevenue: 85000,
        status: "CONTACTED",
        owner: "Sarah Chen",
      },
      {
        fullName: "Elena Ruiz",
        email: "elena@ruizsalon.com",
        phone: "7865550177",
        businessName: "Ruiz Beauty Salon",
        source: "Google",
        campaign: "Brand Search",
        status: "QUALIFIED",
        owner: "Marcus Webb",
      },
    ],
  });

  console.log(
    `Seeded ${releases.length} releases, ${roadmapItems.length} roadmap items, ${activities.length} activities, ${integrations.length} integrations, and 3 sample leads.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
