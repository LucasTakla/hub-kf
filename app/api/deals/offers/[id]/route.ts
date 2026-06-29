import { NextResponse } from "next/server";

import {
  OFFER_STATUS_TO_DB,
  parseClientOfferStatus,
} from "@/lib/deals/mappers";
import { updateOffer } from "@/lib/deals/server";

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
    typeof body.status === "string" ? parseClientOfferStatus(body.status) : null;

  try {
    const offer = await updateOffer(id, {
      lender: typeof body.lender === "string" ? body.lender : undefined,
      amount:
        typeof body.amount === "number"
          ? body.amount
          : body.amount
            ? Number.parseFloat(String(body.amount))
            : undefined,
      factorRate:
        typeof body.factorRate === "number"
          ? body.factorRate
          : body.factorRate === null
            ? null
            : body.factorRate
              ? Number.parseFloat(String(body.factorRate))
              : undefined,
      term: typeof body.term === "string" ? body.term : body.term === null ? null : undefined,
      paymentFrequency:
        typeof body.paymentFrequency === "string"
          ? body.paymentFrequency
          : body.paymentFrequency === null
            ? null
            : undefined,
      status: parsedStatus ? OFFER_STATUS_TO_DB[parsedStatus] : undefined,
      expirationDate:
        typeof body.expirationDate === "string"
          ? body.expirationDate
            ? new Date(body.expirationDate)
            : null
          : undefined,
      dailyPayment:
        typeof body.dailyPayment === "number"
          ? body.dailyPayment
          : body.dailyPayment === null
            ? null
            : body.dailyPayment
              ? Number.parseFloat(String(body.dailyPayment))
              : undefined,
      notes: typeof body.notes === "string" ? body.notes : body.notes === null ? null : undefined,
    });

    return NextResponse.json({ ok: true, offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update offer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
