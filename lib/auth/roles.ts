import type { UserRole } from "@prisma/client";

export type HubRoleMetadata = "admin" | "leadership" | "member";

const EXECUTIVE_DB_ROLES: UserRole[] = ["ADMIN", "LEADERSHIP"];
const EXECUTIVE_METADATA_ROLES: HubRoleMetadata[] = ["admin", "leadership"];

export function canAccessExecutive(
  dbRole?: UserRole | null,
  metadataRole?: unknown,
): boolean {
  if (dbRole && EXECUTIVE_DB_ROLES.includes(dbRole)) return true;

  if (typeof metadataRole === "string") {
    const normalized = metadataRole.toLowerCase() as HubRoleMetadata;
    return EXECUTIVE_METADATA_ROLES.includes(normalized);
  }

  return false;
}

export function isExecutivePath(pathname: string): boolean {
  return pathname === "/executive" || pathname.startsWith("/executive/");
}
