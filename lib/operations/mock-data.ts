import type { ActivityEvent, SopDocument, TeamMember } from "./types";

export const activityEvents: ActivityEvent[] = [
  {
    id: "evt-1",
    module: "sales",
    title: "Offer received",
    description: "Offer received from Credibly — $75,000 at 1.28 factor for Joe's Restaurant",
    user: "System",
    timestamp: "2026-06-11T09:15:00",
    entityType: "Offer",
    entityName: "Joe's Restaurant",
  },
  {
    id: "evt-2",
    module: "sales",
    title: "Application submitted",
    description: "Application submitted to CAN Capital for Coastal Dental Group",
    user: "Alex Rivera",
    timestamp: "2026-06-11T08:42:00",
    entityType: "Application",
    entityName: "Coastal Dental Group",
  },
  {
    id: "evt-3",
    module: "sales",
    title: "Deal stage changed",
    description: "Metro Fitness Studio moved to Negotiating",
    user: "Maria Santos",
    timestamp: "2026-06-11T08:30:00",
    entityType: "Deal",
    entityName: "Metro Fitness Studio",
  },
  {
    id: "evt-4",
    module: "sales",
    title: "Offer accepted",
    description: "Client accepted Credibly offer — $120,000 for Metro Fitness Studio",
    user: "Maria Santos",
    timestamp: "2026-06-10T15:00:00",
    entityType: "Offer",
    entityName: "Metro Fitness Studio",
  },
  {
    id: "evt-5",
    module: "marketing",
    title: "Campaign launched",
    description: "MCA — Spanish Retargeting campaign budget increased to $168/day",
    user: "Maria Santos",
    timestamp: "2026-06-10T11:20:00",
    entityType: "Campaign",
    entityName: "Spanish Retargeting",
  },
  {
    id: "evt-6",
    module: "marketing",
    title: "Creative approved",
    description: "UGC — Maria Funding Story approved for Meta deployment",
    user: "Jordan Kim",
    timestamp: "2026-06-10T10:05:00",
    entityType: "Creative",
    entityName: "Maria Funding Story",
  },
  {
    id: "evt-7",
    module: "operations",
    title: "SOP updated",
    description: "How to Present an Offer — version 3 published",
    user: "Alex Rivera",
    timestamp: "2026-06-09T16:30:00",
    entityType: "SOP",
    entityName: "How to Present an Offer",
  },
  {
    id: "evt-8",
    module: "roadmap",
    title: "Task completed",
    description: "Sales Pipeline Kanban — marked as Done in V3 release",
    user: "Jordan Kim",
    timestamp: "2026-06-09T14:00:00",
    entityType: "Task",
    entityName: "Sales Pipeline Kanban",
  },
  {
    id: "evt-9",
    module: "sales",
    title: "Application submitted",
    description: "Application submitted to OnDeck for Joe's Restaurant",
    user: "Maria Santos",
    timestamp: "2026-06-09T11:00:00",
    entityType: "Application",
    entityName: "Joe's Restaurant",
  },
  {
    id: "evt-10",
    module: "operations",
    title: "Team member added",
    description: "Jordan Kim joined as Marketing Operations Specialist",
    user: "System",
    timestamp: "2026-06-08T09:00:00",
    entityType: "Team",
    entityName: "Jordan Kim",
  },
  {
    id: "evt-11",
    module: "ai",
    title: "Agent deployed",
    description: "Lead Qualification Agent v2 deployed to production",
    user: "Alex Rivera",
    timestamp: "2026-06-08T08:15:00",
    entityType: "Agent",
    entityName: "Lead Qualification Agent",
  },
  {
    id: "evt-12",
    module: "executive",
    title: "KPI report generated",
    description: "Weekly revenue and pipeline KPI summary exported",
    user: "System",
    timestamp: "2026-06-07T17:00:00",
    entityType: "Report",
    entityName: "Weekly KPI Summary",
  },
  {
    id: "evt-13",
    module: "sales",
    title: "Document uploaded",
    description: "Bank statements verified for Green Leaf Landscaping",
    user: "Jordan Kim",
    timestamp: "2026-06-07T14:22:00",
    entityType: "Document",
    entityName: "Green Leaf Landscaping",
  },
  {
    id: "evt-14",
    module: "marketing",
    title: "Copy generated",
    description: "Email follow-up sequence generated in Copy Lab for application reminders",
    user: "Jordan Kim",
    timestamp: "2026-06-07T11:45:00",
    entityType: "Copy",
    entityName: "Application Reminder Sequence",
  },
  {
    id: "evt-15",
    module: "roadmap",
    title: "Release shipped",
    description: "V3 Sales Module — Pipeline, Applications, Offers released",
    user: "Jordan Kim",
    timestamp: "2026-06-06T18:00:00",
    entityType: "Release",
    entityName: "V3 Sales Module",
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "tm-1",
    name: "Maria Santos",
    role: "Senior Funding Advisor",
    email: "maria@kapitalfunding.com",
    dealsOwned: 18,
    applicationsManaged: 42,
    offersManaged: 12,
    openRoadmapTasks: 3,
    recentActivity: [
      "Presented offer to Joe's Restaurant client",
      "Submitted application to OnDeck",
      "Deal moved to Negotiating — Metro Fitness Studio",
    ],
    assignedDeals: [
      { name: "Joe's Restaurant", stage: "Offers Received", amount: 80000 },
      { name: "Metro Fitness Studio", stage: "Negotiating", amount: 120000 },
      { name: "Elite HVAC Services", stage: "Qualified", amount: 65000 },
    ],
    assignedApplications: [
      { business: "Joe's Restaurant", lender: "CAN Capital", status: "Submitted" },
      { business: "Joe's Restaurant", lender: "Credibly", status: "Approved" },
      { business: "Coastal Dental Group", lender: "CAN Capital", status: "Draft" },
    ],
    assignedOffers: [
      { business: "Joe's Restaurant", lender: "Credibly", amount: 75000, status: "Received" },
      { business: "Joe's Restaurant", lender: "CAN Capital", amount: 80000, status: "Presented" },
      { business: "Metro Fitness Studio", lender: "Credibly", amount: 120000, status: "Accepted" },
    ],
    roadmapTasks: [
      { title: "Integrate Meta Ads API", status: "In Progress", dueDate: "2026-06-20" },
      { title: "Offer comparison UX polish", status: "Planned", dueDate: "2026-06-25" },
    ],
    activityFeed: activityEvents.filter((e) => e.user === "Maria Santos" || e.user === "System").slice(0, 5),
  },
  {
    id: "tm-2",
    name: "Alex Rivera",
    role: "Funding Advisor",
    email: "alex@kapitalfunding.com",
    dealsOwned: 12,
    applicationsManaged: 28,
    offersManaged: 6,
    openRoadmapTasks: 5,
    recentActivity: [
      "Submitted application to Fora Financial",
      "Updated SOP — How to Present an Offer",
      "Deployed Lead Qualification Agent v2",
    ],
    assignedDeals: [
      { name: "Sunrise Auto Repair", stage: "Submitted", amount: 45000 },
      { name: "Coastal Dental Group", stage: "Ready to Submit", amount: 200000 },
      { name: "Bella's Boutique", stage: "Funded", amount: 30000 },
    ],
    assignedApplications: [
      { business: "Sunrise Auto Repair", lender: "Fora Financial", status: "Under Review" },
      { business: "Sunrise Auto Repair", lender: "Kabbage", status: "Submitted" },
    ],
    assignedOffers: [
      { business: "Bella's Boutique", lender: "Credibly", amount: 28000, status: "Accepted" },
    ],
    roadmapTasks: [
      { title: "Clerk auth production setup", status: "In Progress", dueDate: "2026-06-15" },
      { title: "Database migration strategy", status: "Planned", dueDate: "2026-06-22" },
      { title: "API rate limiting", status: "Planned", dueDate: "2026-06-28" },
    ],
    activityFeed: activityEvents.filter((e) => e.user === "Alex Rivera").slice(0, 5),
  },
  {
    id: "tm-3",
    name: "Jordan Kim",
    role: "Marketing Operations",
    email: "jordan@kapitalfunding.com",
    dealsOwned: 8,
    applicationsManaged: 14,
    offersManaged: 3,
    openRoadmapTasks: 8,
    recentActivity: [
      "Creative approved — UGC Maria Funding Story",
      "Completed Sales Pipeline Kanban task",
      "Shipped V3 Sales Module release",
    ],
    assignedDeals: [
      { name: "Green Leaf Landscaping", stage: "Collecting Docs", amount: 35000 },
      { name: "Quick Print Solutions", stage: "New", amount: 25000 },
      { name: "Pacific Plumbing Co", stage: "Lost", amount: 55000 },
    ],
    assignedApplications: [
      { business: "Joe's Restaurant", lender: "Rapid Finance", status: "Under Review" },
    ],
    assignedOffers: [],
    roadmapTasks: [
      { title: "Marketing module UI", status: "Done", dueDate: "2026-06-10" },
      { title: "Operations module design", status: "In Progress", dueDate: "2026-06-14" },
      { title: "Overview dashboard widgets", status: "Planned", dueDate: "2026-06-30" },
    ],
    activityFeed: activityEvents.filter((e) => e.user === "Jordan Kim").slice(0, 5),
  },
];

export const sopDocuments: SopDocument[] = [
  {
    id: "sop-1",
    title: "How to Qualify a Deal",
    category: "sales",
    tags: ["qualification", "deals", "intake"],
    summary: "Steps to evaluate a new funding opportunity and determine fit before submission.",
    content: `## Overview
Qualify every inbound lead within 24 hours of deal creation.

## Steps
1. **Verify business information** — Confirm legal name, EIN, and time in business (minimum 6 months).
2. **Review revenue** — Annual revenue should meet lender minimums ($100K+ for most MCA programs).
3. **Check industry** — Confirm industry is accepted by target lenders.
4. **Assess urgency** — Document funding timeline and use of funds.
5. **Score the deal** — Assign priority (High/Medium/Low) based on revenue, docs readiness, and close probability.
6. **Move to Qualified** — Update deal stage and assign owner if not already assigned.

## Red Flags
- Negative bank balance trends
- Recent bankruptcy or tax liens
- Industry on lender exclusion lists`,
    version: 2,
    updatedAt: "2026-05-20",
    updatedBy: "Maria Santos",
    versions: [
      { version: 2, updatedAt: "2026-05-20", updatedBy: "Maria Santos", note: "Added red flags section" },
      { version: 1, updatedAt: "2026-03-10", updatedBy: "Alex Rivera", note: "Initial version" },
    ],
  },
  {
    id: "sop-2",
    title: "How to Submit an Application",
    category: "sales",
    tags: ["applications", "lenders", "submission"],
    summary: "Process for submitting a deal to a lender with required documentation.",
    content: `## Prerequisites
- Deal is in "Ready to Submit" stage
- All required documents verified (bank statements, ID, voided check)
- Lender selected based on deal profile

## Submission Steps
1. Log into lender portal or use API integration
2. Enter business and owner information from deal record
3. Upload verified documents
4. Submit and record submission date in Hub
5. Update application status to "Submitted"
6. Set follow-up reminder for 2 business days

## Post-Submission
- Monitor lender portal for status updates
- Update application status when lender responds
- Notify deal owner of approval or decline`,
    version: 3,
    updatedAt: "2026-06-01",
    updatedBy: "Alex Rivera",
    versions: [
      { version: 3, updatedAt: "2026-06-01", updatedBy: "Alex Rivera", note: "Added API integration notes" },
      { version: 2, updatedAt: "2026-04-15", updatedBy: "Maria Santos", note: "Updated document checklist" },
      { version: 1, updatedAt: "2026-02-01", updatedBy: "Alex Rivera", note: "Initial version" },
    ],
  },
  {
    id: "sop-3",
    title: "How to Present an Offer",
    category: "sales",
    tags: ["offers", "presentation", "client"],
    summary: "Guidelines for presenting funding offers to clients and closing deals.",
    content: `## Before the Call
- Compare all offers using the Offer Comparison tool
- Identify best factor rate and highest amount options
- Prepare side-by-side summary for client

## Presentation Steps
1. Walk client through each offer — amount, factor rate, term, daily payment
2. Highlight recommended option with rationale
3. Address questions about payback structure
4. Document client preference in deal notes
5. Update offer status to "Presented"

## Closing
- Collect signed funding agreement
- Update offer status to "Accepted"
- Move deal to Funded stage upon confirmation`,
    version: 3,
    updatedAt: "2026-06-09",
    updatedBy: "Alex Rivera",
    versions: [
      { version: 3, updatedAt: "2026-06-09", updatedBy: "Alex Rivera", note: "Added comparison tool reference" },
      { version: 2, updatedAt: "2026-05-01", updatedBy: "Maria Santos", note: "Updated closing steps" },
      { version: 1, updatedAt: "2026-03-01", updatedBy: "Maria Santos", note: "Initial version" },
    ],
  },
  {
    id: "sop-4",
    title: "How to Launch a Campaign",
    category: "marketing",
    tags: ["campaigns", "meta", "ads"],
    summary: "Process for launching a new paid acquisition campaign on Meta.",
    content: `## Pre-Launch Checklist
- Creative assets approved in Creatives library
- Copy reviewed in Copy Lab
- Landing page / form tested
- UTM parameters configured
- Budget and audience defined

## Launch Steps
1. Create campaign in Meta Ads Manager (or via Hub integration)
2. Set daily budget and targeting
3. Attach approved creatives
4. Enable campaign and monitor first 24 hours
5. Log campaign in Hub Campaigns module

## Post-Launch
- Review performance after 48 hours
- Check lead quality in Sales Pipeline
- Adjust budget based on CPL and funded deal rate`,
    version: 1,
    updatedAt: "2026-05-15",
    updatedBy: "Jordan Kim",
    versions: [
      { version: 1, updatedAt: "2026-05-15", updatedBy: "Jordan Kim", note: "Initial version" },
    ],
  },
  {
    id: "sop-5",
    title: "How to Onboard a Lender",
    category: "operations",
    tags: ["lenders", "onboarding", "partners"],
    summary: "Steps to add a new lender partner to the platform and team workflow.",
    content: `## Information Required
- Lender name, website, and contact details
- Funding types and amount ranges
- Industry restrictions
- Submission process and portal access
- Commission structure

## Onboarding Steps
1. Create lender profile in Hub Lenders module
2. Document submission requirements in SOP
3. Set up portal credentials (store in secure vault)
4. Brief funding team on lender criteria
5. Submit test application if available
6. Mark lender as active after successful test`,
    version: 1,
    updatedAt: "2026-04-20",
    updatedBy: "Alex Rivera",
    versions: [
      { version: 1, updatedAt: "2026-04-20", updatedBy: "Alex Rivera", note: "Initial version" },
    ],
  },
  {
    id: "sop-6",
    title: "How to Create a New Automation",
    category: "ai",
    tags: ["automation", "workflows", "agents"],
    summary: "Guidelines for building AI-powered automations in the Hub.",
    content: `## When to Automate
- Repetitive tasks with clear rules (lead routing, follow-ups)
- Data enrichment or scoring
- Notification triggers

## Creation Steps
1. Define trigger event and conditions
2. Map workflow steps in AI Workflows module
3. Configure agent prompts in Prompt Library
4. Test in sandbox environment
5. Deploy to production with monitoring
6. Document in SOP and notify affected teams`,
    version: 1,
    updatedAt: "2026-05-01",
    updatedBy: "Alex Rivera",
    versions: [
      { version: 1, updatedAt: "2026-05-01", updatedBy: "Alex Rivera", note: "Initial version" },
    ],
  },
  {
    id: "sop-7",
    title: "How to Manage Compliance Requirements",
    category: "executive",
    tags: ["compliance", "legal", "regulatory"],
    summary: "Overview of compliance obligations for funding brokerage operations.",
    content: `## Key Areas
- Client disclosure requirements
- Data privacy (PII handling)
- Lender agreement terms
- Commission disclosure

## Ongoing Tasks
- Quarterly compliance review
- Document retention policy (7 years)
- Training for new team members
- Audit trail via Activity log

## Escalation
Contact compliance officer for any regulatory questions before proceeding.`,
    version: 1,
    updatedAt: "2026-03-01",
    updatedBy: "Maria Santos",
    versions: [
      { version: 1, updatedAt: "2026-03-01", updatedBy: "Maria Santos", note: "Initial version" },
    ],
  },
];

export const sopAiSampleAnswer =
  "After receiving an offer:\n\n1. **Compare offers** using the Offer Comparison tool in Sales → Offers or the Deal detail panel.\n2. **Present to client** following the \"How to Present an Offer\" SOP — walk through amount, factor rate, term, and daily payment.\n3. **Document preference** in deal notes and update offer status to \"Presented\".\n4. **Upon acceptance**, collect signed funding agreement, update offer to \"Accepted\", and move deal to Funded.\n\nSee SOP: How to Present an Offer (v3) for full details.";
