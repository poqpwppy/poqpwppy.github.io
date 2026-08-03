// Post-build: emit a root `index.html` that redirects `/` to `/vi`.
//
// With `localePrefix: "always"`, the static export only produces `/vi` and
// `/en` (plus their subtrees) — there is no route that maps to `/`, so
// GitHub Pages would serve `404.html` for the site root. `next build` runs
// this script last (`"build": "next build && node scripts/ensure-root-page.mjs"`)
// to write an `index.html` that immediately redirects to the default locale.
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const target = "/vi";

if (!existsSync(join(outDir, "vi.html"))) {
  console.error("[ensure-root-page] out/vi.html not found; expected locale root for the default locale. Aborting build.");
  process.exit(1);
}

const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)});</script>
    <title>poqpwppy</title>
  </head>
  <body></body>
</html>
`;

writeFileSync(join(outDir, "index.html"), html);
console.log(`[ensure-root-page] wrote out/index.html -> redirect to ${target}`);
