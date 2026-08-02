// One-off content pipeline smoke test.
// Usage: node scripts/build-content.mjs
import { createBuilder } from "@content-collections/core";

const builder = await createBuilder(
  new URL("../content-collections.ts", import.meta.url).pathname,
);

builder.on("builder:end", async () => {
  console.log("✓ builder finished");
});

builder.on("_error", (e) => {
  console.error("✗ builder error:", e?.error ?? e);
  process.exitCode = 1;
});

await builder.build();
process.exit(process.exitCode ?? 0);
