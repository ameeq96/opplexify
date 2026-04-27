const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const webOutDir = path.join(rootDir, "apps", "web", "out");
const hostingerOutputDir = path.join(rootDir, "apps", "web", ".next");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const build = spawnSync(npmCommand, ["--workspace", "apps/web", "run", "build"], {
  cwd: rootDir,
  env: {
    ...process.env,
    NEXT_OUTPUT: "export"
  },
  stdio: "inherit"
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const indexHtml = path.join(webOutDir, "index.html");

if (!fs.existsSync(indexHtml)) {
  console.error(`Static export was not found at ${webOutDir}`);
  process.exit(1);
}

fs.rmSync(hostingerOutputDir, { recursive: true, force: true });
fs.cpSync(webOutDir, hostingerOutputDir, { recursive: true });

console.log(`Hostinger static output copied to ${path.relative(rootDir, hostingerOutputDir)}`);
