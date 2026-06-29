import { NextResponse } from "next/server";

import {
  APP_STATUS_TO_DB,
  parseClientApplicationStatus,
} from "@/lib/deals/mappers";
import { updateApplication } from "@/lib/deals/server";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedStatus =
    typeof body.status === "string" ? parseClientApplicationStatus(body.status) : null;

  try {
    const app = await updateApplication(id, {
      lender: typeof body.lender === "string" ? body.lender : undefined,
      status: parsedStatus ? APP_STATUS_TO_DB[parsedStatus] : undefined,
      assignedUser: typeof body.assignedUser === "string" ? body.assignedUser : undefined,
      notes: typeof body.notes === "string" ? body.notes : body.notes === null ? null : undefined,
      submissionDate:
        typeof body.submissionDate === "string"
          ? body.submissionDate
            ? new Date(body.submissionDate)
            : null
          : undefined,
    });

    return NextResponse.json({ ok: true, application: app });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
