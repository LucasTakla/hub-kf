export function isVideoMimeType(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
