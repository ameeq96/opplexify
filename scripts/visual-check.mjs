import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";
const outputDir = "tmp/playwright-ui";
const executablePath = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "mobile", width: 390, height: 900 }
];

const pages = [
  { name: "home", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "builder", path: "/build-your-project" },
  { name: "contact", path: "/contact" },
  { name: "admin", path: "/admin" }
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

const findings = [];

for (const viewport of viewports) {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: {
        width: viewport.width,
        height: viewport.height
      },
      deviceScaleFactor: 1
    });

    await context.addInitScript((selectedTheme) => {
      window.localStorage.setItem("theme", selectedTheme);
      document.documentElement.classList.toggle("dark", selectedTheme === "dark");
    }, theme);

    for (const target of pages) {
      const page = await context.newPage();
      const url = `${baseUrl}${target.path}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.screenshot({
        path: `${outputDir}/${target.name}-${viewport.name}-${theme}.png`,
        fullPage: true
      });

      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const horizontalOverflow = Math.max(body.scrollWidth, doc.scrollWidth) - doc.clientWidth;
        const buttons = Array.from(document.querySelectorAll("button, a")).map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            text: node.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "",
            width: rect.width,
            height: rect.height,
            left: rect.left,
            right: rect.right
          };
        });

        const crampedTargets = buttons.filter((item) => item.width > 0 && item.height > 0 && item.height < 28);
        const offscreenTargets = buttons.filter((item) => item.left < -1 || item.right > doc.clientWidth + 1);

        return {
          horizontalOverflow,
          crampedTargets,
          offscreenTargets
        };
      });

      if (result.horizontalOverflow > 2 || result.crampedTargets.length || result.offscreenTargets.length) {
        findings.push({
          page: target.name,
          viewport: viewport.name,
          theme,
          ...result
        });
      }

      await page.close();
    }

    await context.close();
  }
}

await browser.close();

console.log(JSON.stringify({ outputDir, findings }, null, 2));
