export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "release";
  let slug = root;
  let counter = 2;
  while (await exists(slug)) {
    slug = `${root}-${counter}`;
    counter += 1;
  }
  return slug;
}
