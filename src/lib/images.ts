// Responsive variants for every photo in src/assets.
// Each photo exists as name.webp (≤1600w), name-sm.webp (640w), name-xs.webp (240w) and, for wide photos, name-md.webp (960w).
// Given the URL of the large file, return a srcset so the browser downloads only the size it needs.

const all = import.meta.glob("../assets/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byLarge = new Map<
  string,
  { sm: string | undefined; xs: string | undefined; md: string | undefined }
>();
for (const [path, url] of Object.entries(all)) {
  const m = path.match(/\/([a-z0-9-]+?)(-sm|-xs|-md)?\.webp$/);
  if (!m || m[2]) continue;
  const base = path.slice(0, -".webp".length);
  byLarge.set(url, {
    sm: all[`${base}-sm.webp`],
    xs: all[`${base}-xs.webp`],
    md: all[`${base}-md.webp`],
  });
}

export function srcSetFor(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const v = byLarge.get(src);
  if (!v) return undefined;
  // Photos with a -md variant are 1600px wide; the rest are 1024px originals.
  return [
    v.xs && `${v.xs} 240w`,
    v.sm && `${v.sm} 640w`,
    v.md && `${v.md} 960w`,
    `${src} ${v.md ? 1600 : 1024}w`,
  ]
    .filter(Boolean)
    .join(", ");
}
