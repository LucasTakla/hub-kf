import { redirect } from "next/navigation";

import { resolveExecutiveAccess } from "@/lib/auth/access";

export default async function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAccess = await resolveExecutiveAccess();
  if (!hasAccess) redirect("/overview");
  return children;
}
