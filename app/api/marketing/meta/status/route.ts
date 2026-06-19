import { NextResponse } from "next/server";

import { getMetaConnectionStatus } from "@/lib/marketing/server";

export async function GET() {
  const status = await getMetaConnectionStatus();
  return NextResponse.json(status);
}
