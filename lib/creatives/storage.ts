import { mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXT_BY_MIME: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function getCreativeUploadDir(): string {
  const configured = process.env.CREATIVE_UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "public", "creatives");
}

export async function ensureCreativeUploadDir(): Promise<string> {
  const dir = getCreativeUploadDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export function getMaxUploadBytes(): number {
  const mb = Number.parseInt(process.env.CREATIVE_MAX_UPLOAD_MB ?? "200", 10);
  return (Number.isFinite(mb) ? mb : 200) * 1024 * 1024;
}

export function isAllowedCreativeMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export function extensionForMimeType(mimeType: string): string {
  return EXT_BY_MIME[mimeType] ?? "";
}

export function sanitizeStoredFileName(fileName: string): string {
  return path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function getCreativeAssetPath(fileName: string): string {
  const safeName = sanitizeStoredFileName(fileName);
  return path.join(getCreativeUploadDir(), safeName);
}

export function getCreativeAssetUrl(fileName: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const encoded = encodeURIComponent(sanitizeStoredFileName(fileName));
  return `${base}/api/creatives/asset/${encoded}`;
}
