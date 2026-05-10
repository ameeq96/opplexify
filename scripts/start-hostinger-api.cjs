const fs = require("node:fs");
const path = require("node:path");

const candidates = [
  path.join(process.cwd(), "apps/api/dist/main.js"),
  path.join(process.cwd(), "dist/main.js"),
  path.join(__dirname, "../apps/api/dist/main.js")
];

const entry = candidates.find((candidate) => fs.existsSync(candidate));

if (!entry) {
  console.error("Could not find compiled API entry. Tried:");
  for (const candidate of candidates) console.error("- " + candidate);
  process.exit(1);
}

require(entry);
