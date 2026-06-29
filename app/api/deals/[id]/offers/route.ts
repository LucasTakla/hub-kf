import { NextResponse } from "next/server";

import {
  OFFER_STATUS_TO_DB,
  parseClientOfferStatus,
} from "@/lib/deals/mappers";
import { createOffer } from "@/lib/deals/server";

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
  const amount = typeof body.amount === "number" ? body.amount : Number.parseFloat(String(body.amount ?? ""));

  if (!lender) {
    return NextResponse.json({ error: "Lender name is required" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Valid offer amount is required" }, { status: 400 });
  }

  const parsedStatus =
    typeof body.status === "string" ? parseClientOfferStatus(body.status) : null;

  try {
    const offer = await createOffer({
      dealId,
      lender,
      amount,
      factorRate:
        typeof body.factorRate === "number"
          ? body.factorRate
          : body.factorRate
            ? Number.parseFloat(String(body.factorRate))
            : null,
      term: typeof body.term === "string" ? body.term : null,
      paymentFrequency: typeof body.paymentFrequency === "string" ? body.paymentFrequency : null,
      status: parsedStatus ? OFFER_STATUS_TO_DB[parsedStatus] : "RECEIVED",
      expirationDate:
        typeof body.expirationDate === "string" && body.expirationDate
          ? new Date(body.expirationDate)
          : null,
      dailyPayment:
        typeof body.dailyPayment === "number"
          ? body.dailyPayment
          : body.dailyPayment
            ? Number.parseFloat(String(body.dailyPayment))
            : null,
      notes: typeof body.notes === "string" ? body.notes : null,
    });

    return NextResponse.json({ ok: true, offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create offer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
