import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCreativeUploadDir, isCreativeUploadDirConfigured } from "@/lib/creatives/storage";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const persistent = isCreativeUploadDirConfigured();

  return NextResponse.json({
    uploadDir: getCreativeUploadDir(),
    persistent,
    warning: persistent
      ? null
      : "CREATIVE_UPLOAD_DIR is not set. Files save inside the deploy folder (nodejs/) and can be lost on redeploy.",
  });
}
