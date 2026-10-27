// Exports the menu and order settings as JSON for the PHP back-end (static/public_html build).
// Usage: node scripts/export-menu.mjs <output.json>
import { rolldown } from "rolldown";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const out = process.argv[2];
if (!out) throw new Error("Usage: node scripts/export-menu.mjs <output.json>");

const dir = mkdtempSync(join(tmpdir(), "ib-menu-"));
const entry = join(dir, "entry.ts");
writeFileSync(
  entry,
  `import { menu } from ${JSON.stringify(join(root, "src/data/menu.ts"))};
   import { eventTypes } from ${JSON.stringify(join(root, "src/data/content.ts"))};
   import { site } from ${JSON.stringify(join(root, "src/config/site.ts"))};
   export default {
     minimumOrder: site.minimumOrder,
     leadTimeDays: site.leadTimeDays,
     eventTypes: [...eventTypes],
     menu: menu.map((m) => ({ id: m.id, name: m.name, category: m.category, size: m.sizeLabel, price: m.price, sizes: m.sizes ?? [] })),
   };`,
);
const bundle = await rolldown({
  input: entry,
  resolve: { alias: { "@": join(root, "src") } },
  plugins: [{ name: "stub-assets", load(id) { if (/\.(webp|jpe?g|png|svg)$/.test(id)) return "export default ''"; } }],
});
const file = join(dir, "out.mjs");
await bundle.write({ file, format: "esm" });
const data = (await import(pathToFileURL(file).href)).default;
writeFileSync(out, JSON.stringify(data, null, 2));
rmSync(dir, { recursive: true, force: true });
console.log(`menu.json: ${data.menu.length} items, minimum $${data.minimumOrder}`);
