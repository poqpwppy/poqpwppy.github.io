// postinstall: rewrite the next-intl `next-intl/config` stubs so they load
// the real request config directly, by RELATIVE path. This makes resolution
// independent of any webpack/turbopack alias behavior.
//
// Background: `createNextIntlPlugin` normally makes `next-intl/config`
// resolve to `./i18n/request.ts` through a webpack `resolve.alias`. The alias
// works locally but has proven unreliable in GitHub Actions CI for this repo,
// so the build falls back to the package's stub (`dist/esm/*/config.js`),
// which throws "Couldn't find next-intl config file" at prerender time.
//
// These stubs are bundled into the app, so a plain relative import from the
// stub to the project's request config is resolved by whatever bundler is in
// use (webpack, turbopack, ...) and works unconditionally.
//
// Path from node_modules/next-intl/dist/esm/<env>/config.js to the project
// root: ../../../../..  (production -> esm -> dist -> next-intl ->
// node_modules -> project root).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const STUBS = [
  "node_modules/next-intl/dist/esm/production/config.js",
  "node_modules/next-intl/dist/esm/development/config.js",
];
const TARGET = "../../../../../i18n/request.ts";
const MARKER = "Couldn't find next-intl config file";
const REPLACEMENT = `import getConfig from ${JSON.stringify(TARGET)};\nexport default getConfig;\n`;

let patched = 0;
for (const rel of STUBS) {
  const file = join(ROOT, rel);
  if (!existsSync(file)) {
    console.warn(`[patch-next-intl] skip (not found): ${rel}`);
    continue;
  }
  const src = readFileSync(file, "utf8");
  if (src.includes(TARGET)) {
    console.log(`[patch-next-intl] already patched: ${rel}`);
    continue;
  }
  if (!src.includes(MARKER)) {
    console.warn(`[patch-next-intl] unexpected content in ${rel}; leaving untouched`);
    continue;
  }
  writeFileSync(file, REPLACEMENT);
  patched += 1;
  console.log(`[patch-next-intl] patched: ${rel}`);
}

if (patched === 0) {
  console.warn("[patch-next-intl] no stubs were patched — next-intl layout may have changed");
}
