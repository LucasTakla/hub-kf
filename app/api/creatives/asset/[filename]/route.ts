import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import { getCreativeAssetPath, sanitizeStoredFileName } from "@/lib/creatives/storage";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ filename: string }> };

export async function GET(request: Request, { params }: RouteProps) {
  const { filename } = await params;
  const safeName = sanitizeStoredFileName(decodeURIComponent(filename));
  const filePath = getCreativeAssetPath(safeName);

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const fileStat = await stat(filePath);
  const range = request.headers.get("range");
  const contentType = mimeTypeForExtension(path.extname(safeName));

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = Number.parseInt(startStr, 10);
    const end = endStr ? Number.parseInt(endStr, 10) : fileStat.size - 1;

    if (Number.isNaN(start) || start >= fileStat.size || end >= fileStat.size) {
      return new Response("Invalid range", { status: 416 });
    }

    const chunkSize = end - start + 1;
    const stream = createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new Response(webStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(chunkSize),
        "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileStat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function mimeTypeForExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
