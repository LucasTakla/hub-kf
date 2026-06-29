import { mapGhlStageToDealStage } from "@/lib/deals/stage-map";
import type { DealSyncInput } from "@/lib/deals/types";
import { parseCsvText } from "@/lib/leads/parse-csv";

export { parseCsvText };

type CsvField =
  | "ghlOpportunityId"
  | "ghlContactId"
  | "stage"
  | "businessName"
  | "contactName"
  | "contactEmail"
  | "contactPhone"
  | "owner"
  | "fundingAmount"
  | "fundedAmount"
  | "source"
  | "industry"
  | "internalNotes";

const HEADER_ALIASES: Record<string, CsvField> = {
  opportunity_id: "ghlOpportunityId",
  ghl_opportunity_id: "ghlOpportunityId",
  opportunityid: "ghlOpportunityId",
  opp_id: "ghlOpportunityId",
  deal_id: "ghlOpportunityId",
  id: "ghlOpportunityId",
  contact_id: "ghlContactId",
  ghl_contact_id: "ghlContactId",
  contactid: "ghlContactId",
  stage: "stage",
  pipeline_stage: "stage",
  stage_name: "stage",
  pipeline_stage_name: "stage",
  status: "stage",
  opportunity_stage: "stage",
  business_name: "businessName",
  businessname: "businessName",
  company: "businessName",
  company_name: "businessName",
  opportunity_name: "businessName",
  opportunityname: "businessName",
  name: "businessName",
  title: "businessName",
  contact_name: "contactName",
  contactname: "contactName",
  full_name: "contactName",
  email: "contactEmail",
  contact_email: "contactEmail",
  email_address: "contactEmail",
  phone: "contactPhone",
  contact_phone: "contactPhone",
  phone_number: "contactPhone",
  mobile: "contactPhone",
  owner: "owner",
  assigned_to: "owner",
  assignedto: "owner",
  user: "owner",
  funding_amount: "fundingAmount",
  fundingamount: "fundingAmount",
  amount: "fundingAmount",
  monetary_value: "fundingAmount",
  monetaryvalue: "fundingAmount",
  value: "fundingAmount",
  deal_value: "fundingAmount",
  funded_amount: "fundedAmount",
  fundedamount: "fundedAmount",
  source: "source",
  lead_source: "source",
  industry: "industry",
  notes: "internalNotes",
  internal_notes: "internalNotes",
};

function resolveCsvField(header: string): CsvField | null {
  return HEADER_ALIASES[header] ?? null;
}

function parseNumber(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function csvRowsToDealSyncInputs(headers: string[], rows: string[][]): DealSyncInput[] {
  const fieldIndexes = headers.map((header) => resolveCsvField(header));

  return rows
    .map((row) => {
      const input: DealSyncInput = {
        action: "opportunity-created",
        ghlOpportunityId: "",
      };

      let rawStage: string | undefined;

      fieldIndexes.forEach((field, index) => {
        const value = row[index]?.trim();
        if (!field || !value) return;

        if (field === "stage") {
          rawStage = value;
          return;
        }

        if (field === "fundingAmount" || field === "fundedAmount") {
          const parsed = parseNumber(value);
          if (parsed != null) input[field] = parsed;
          return;
        }

        input[field] = value;
      });

      if (!input.ghlOpportunityId?.trim()) return null;

      if (rawStage) {
        input.ghlStageName = rawStage;
        const mapped = mapGhlStageToDealStage(rawStage);
        if (mapped) input.stage = mapped;
      }

      if (input.contactEmail) {
        input.contactEmail = input.contactEmail.toLowerCase();
      }

      return input;
    })
    .filter((item): item is DealSyncInput => item !== null && Boolean(item.ghlOpportunityId));
}
