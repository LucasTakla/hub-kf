import { NextResponse } from "next/server";

import {
  APP_STATUS_TO_DB,
  parseClientApplicationStatus,
} from "@/lib/deals/mappers";
import { createApplication } from "@/lib/deals/server";
import type { ApplicationStatus } from "@/lib/sales/types";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const { id: dealId } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lender = typeof body.lender === "string" ? body.lender.trim() : "";
  if (!lender) {
    return NextResponse.json({ error: "Lender name is required" }, { status: 400 });
  }

  let status = body.status;
  const parsedStatus =
    typeof status === "string" ? parseClientApplicationStatus(status) : null;
  const dbStatus = parsedStatus ? APP_STATUS_TO_DB[parsedStatus] : "DRAFT";

  try {
    const app = await createApplication({
      dealId,
      lender,
      status: dbStatus,
      assignedUser: typeof body.assignedUser === "string" ? body.assignedUser : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      submissionDate:
        typeof body.submissionDate === "string" && body.submissionDate
          ? new Date(body.submissionDate)
          : dbStatus === "SUBMITTED"
            ? new Date()
            : null,
    });

    return NextResponse.json({ ok: true, application: app });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create application";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
