import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import {
  createCreative,
  listCreatives,
  parseCreativeStatus,
  parseCreativeType,
  parseNationality,
  parseTagsInput,
} from "@/lib/creatives/server";
import type { CreativeListFilters } from "@/lib/creatives/types";
import {
  ensureCreativeUploadDir,
  extensionForMimeType,
  getMaxUploadBytes,
  isAllowedCreativeMimeType,
  resolveCreativeMimeType,
  sanitizeStoredFileName,
} from "@/lib/creatives/storage";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const nationality = searchParams.get("nationality") ?? "all";
  const type = searchParams.get("type") ?? "all";
  const search = searchParams.get("search") ?? undefined;

  const result = await listCreatives({
    status: status as CreativeListFilters["status"],
    nationality: nationality as CreativeListFilters["nationality"],
    type: type as CreativeListFilters["type"],
    search,
  });

  return NextResponse.json(result);
}

function uploadErrorMessage(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.message.includes("CREATIVE_UPLOAD_DIR")) {
      return { message: error.message, status: 500 };
    }
    if (error.message.includes("EACCES") || error.message.includes("permission denied")) {
      return {
        message:
          "Server cannot write to the upload folder. Check CREATIVE_UPLOAD_DIR permissions on Hostinger.",
        status: 500,
      };
    }
    if (error.message.includes("ENOSPC")) {
      return { message: "Server storage is full.", status: 507 };
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return {
        message: "Creative table is missing. Run prisma db push against production DATABASE_URL.",
        status: 500,
      };
    }
  }

  return { message: "Upload failed on the server.", status: 500 };
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A video or image file is required" }, { status: 400 });
    }

    const mimeType = resolveCreativeMimeType(file.name, file.type);
    if (!isAllowedCreativeMimeType(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use MP4, WebM, MOV, JPG, PNG, or WebP." },
        { status: 400 },
      );
    }

    if (file.size > getMaxUploadBytes()) {
      return NextResponse.json({ error: "File exceeds upload size limit" }, { status: 400 });
    }

    const name = String(formData.get("name") ?? file.name.replace(/\.[^.]+$/, "")).trim();
    if (!name) {
      return NextResponse.json({ error: "Creative name is required" }, { status: 400 });
    }

    const originalExt = path.extname(file.name).toLowerCase();
    const ext = originalExt || extensionForMimeType(mimeType) || ".mp4";
    const storedFileName = sanitizeStoredFileName(`${randomUUID()}${ext}`);

    const uploadDir = await ensureCreativeUploadDir();
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, storedFileName), buffer);

    const creative = await createCreative({
      name,
      type: parseCreativeType(String(formData.get("type") ?? "")),
      status: parseCreativeStatus(String(formData.get("status") ?? "")),
      nationality: parseNationality(String(formData.get("nationality") ?? "")),
      metaAdName: String(formData.get("metaAdName") ?? "").trim() || null,
      fileName: storedFileName,
      mimeType,
      fileSize: file.size,
      script: String(formData.get("script") ?? "").trim() || null,
      tags: parseTagsInput(String(formData.get("tags") ?? "")),
      creator: String(formData.get("creator") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });

    return NextResponse.json({ ok: true, creative });
  } catch (error) {
    console.error("[POST /api/creatives]", error);
    const { message, status } = uploadErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
