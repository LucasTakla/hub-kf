export type ActivityModule =
  | "marketing"
  | "sales"
  | "operations"
  | "ai"
  | "executive"
  | "roadmap";

export type ActivityEvent = {
  id: string;
  module: ActivityModule;
  title: string;
  description: string;
  user: string;
  timestamp: string;
  entityType?: string;
  entityName?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  dealsOwned: number;
  applicationsManaged: number;
  offersManaged: number;
  openRoadmapTasks: number;
  recentActivity: string[];
  assignedDeals: { name: string; stage: string; amount: number }[];
  assignedApplications: { business: string; lender: string; status: string }[];
  assignedOffers: { business: string; lender: string; amount: number; status: string }[];
  roadmapTasks: { title: string; status: string; dueDate: string }[];
  activityFeed: ActivityEvent[];
};

export type SopCategory = "sales" | "marketing" | "operations" | "ai" | "executive";

export type SopDocument = {
  id: string;
  title: string;
  category: SopCategory;
  tags: string[];
  summary: string;
  content: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  versions: { version: number; updatedAt: string; updatedBy: string; note: string }[];
};

export type TeamDetailTab =
  | "overview"
  | "workload"
  | "deals"
  | "applications"
  | "offers"
  | "roadmap"
  | "activity";
