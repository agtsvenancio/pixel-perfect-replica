// Builds a version of the site that can be extracted straight into public_html
// on shared hosting (Apache/LiteSpeed + PHP + MySQL). No Node.js needed on the server.
//
//   npm run build:static        → dist-static/  (+ italian-bites-public_html.zip)
//
// How it works: build the normal app with VITE_STATIC_API=1 (the browser talks to /api/*.php),
// run it once locally to render "/" and "/admin" to HTML, then copy those pages, the static
// assets and the PHP back-end (php-api/) into one folder.
import { spawn, execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = join(root, "dist-static");
const PORT = 5321;

const run = (cmd, args, env = {}) =>
  execFileSync(cmd, args, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });

console.log("1/5 Building the app (static API mode)…");
rmSync(join(root, ".output"), { recursive: true, force: true });
run("npx", ["vite", "build"], { NITRO_PRESET: "node-server", VITE_STATIC_API: "1" });

console.log("2/5 Rendering pages…");
const server = spawn("node", [join(root, ".output/server/index.mjs")], {
  cwd: root,
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
  stdio: "ignore",
});
const fetchPage = async (path) => {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${path}`);
      if (res.ok) return await res.text();
    } catch {
      /* server still starting */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Could not render ${path}`);
};
let home, admin;
try {
  home = await fetchPage("/");
  admin = await fetchPage("/admin");
} finally {
  server.kill();
}

console.log("3/5 Copying assets…");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const pub = join(root, ".output/public");
for (const name of readdirSync(pub)) cpSync(join(pub, name), join(out, name), { recursive: true });
// Hosting serves its own compression; drop the .br/.gz copies made for the Node server.
const dropCompressed = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) dropCompressed(p);
    else if (/\.(br|gz)$/.test(e.name)) rmSync(p);
  }
};
dropCompressed(out);
writeFileSync(join(out, "index.html"), home);
writeFileSync(join(out, "admin.html"), admin);

console.log("4/5 Adding the PHP back-end…");
cpSync(join(root, "php-api"), join(out, "api"), { recursive: true });
run("node", ["scripts/export-menu.mjs", join(out, "api/menu.json")]);

writeFileSync(
  join(out, ".htaccess"),
  `# Italian Bites — static site + PHP API
Options -Indexes
DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
  RewriteEngine On
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  # /admin → admin.html
  RewriteRule ^admin/?$ admin.html [L]
</IfModule>

# Long cache for fingerprinted assets, no cache for pages
<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|webp|woff2|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

ErrorDocument 404 /index.html
`,
);

console.log("5/5 Zipping…");
const zip = join(root, "italian-bites-public_html.zip");
rmSync(zip, { force: true });
execFileSync("zip", ["-qr", zip, "."], { cwd: out });
console.log(`Done → ${out}\n       ${zip}`);
if (!existsSync(join(out, "api/menu.json"))) throw new Error("menu.json missing");
