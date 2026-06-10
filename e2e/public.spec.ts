import { API_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, assertNoHorizontalOverflow, assertNoNextOverlay, authHeaders, expect, test, waitForApi } from "./fixtures";
import type { Page } from "@playwright/test";

const companyEmail = "admin@opplexify.com";
const companyPhone = "+1 (307) 443-5144";
const companyAddress = "525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States";
const companyLinkedIn = "https://www.linkedin.com/company/opplexify-llc/";

const publicRoutes = [
  { path: "/", marker: /Custom Websites, SaaS Platforms & Business Software Development/i },
  { path: "/about", marker: /Wyoming-formed limited liability company/i },
  { path: "/portfolio", marker: /Selected private client work is available upon request/i },
  { path: "/services", marker: /Software Development Services/i },
  { path: "/services/custom-website-development", marker: /Custom Website Development/i },
  { path: "/pricing", marker: /Custom Software Development Pricing/i },
  { path: "/contact", marker: /Request a Quote or Business Verification Contact/i },
  { path: "/blog", marker: /Web development, SaaS and SEO insights/i },
  { path: "/faq", marker: /Frequently Asked Questions/i },
  { path: "/terms", marker: /Terms of Service/i },
  { path: "/privacy", marker: /Privacy Policy/i },
  { path: "/refund-policy", marker: /Refund Policy/i }
];

const redirectRoutes = [
  { path: "/team", target: /\/about$/ },
  { path: "/team/example", target: /\/about$/ },
  { path: "/work", target: /\/portfolio$/ },
  { path: "/work/example", target: /\/portfolio$/ },
  { path: "/portfolio-grid", target: /\/portfolio$/ }
];

const forbiddenPublicText =
  /since 2017|120\+|7\+|24\/7|Portfolio Visual|principal place of business|Website Client|SaaS Founder|Client logo|support@opplexify\.com|\+1 \(639\) 390-3194|\(505\) 555-0125|Cryptomus|crypto payments|ProfessionalService|LocalBusiness/i;

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 }
];

test.beforeAll(async ({ request }) => {
  await waitForApi(request);
});

for (const viewport of viewports) {
  for (const route of publicRoutes) {
    test(`public page ${route.path} renders cleanly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${route.path} should load`).toBeTruthy();
      await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => undefined);

      await expect(page.locator("body"), `${route.path} should show expected page content`).toContainText(route.marker);
      await expect(page.locator("body"), `${route.path} should not show forbidden credibility claims`).not.toContainText(forbiddenPublicText);
      await assertNoNextOverlay(page);
      await assertNoHorizontalOverflow(page);

      const brokenImages = await page.evaluate(() =>
        Array.from(document.images)
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src)
      );
      expect(brokenImages, `${route.path} should not contain broken images`).toEqual([]);
    });
  }
}

for (const route of redirectRoutes) {
  test(`legacy route ${route.path} redirects`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await expect.poll(() => page.url(), { timeout: 10_000 }).toMatch(route.target);
  });
}

test("contact details, social links and legal identity are consistent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("header nav.main-menu a:visible")).toHaveText([
    "Home",
    "About",
    "Portfolio",
    "Services",
    "Pricing",
    "FAQ",
    "Contact"
  ]);

  const socialLinks = page.locator(".footer-widget-box", { hasText: "Social" }).locator("a");
  await expect(socialLinks).toHaveText(["LinkedIn"]);
  await expect(socialLinks.first()).toHaveAttribute("href", companyLinkedIn);

  await expect(page.locator("body")).toContainText("Opplexify LLC");
  await expect(page.locator("body")).toContainText(companyEmail);
  await expect(page.locator("body")).toContainText(companyPhone);
  await expect(page.locator("body")).toContainText("Business mailing address");
  await expect(page.locator("body")).toContainText(companyAddress);
});

test("schema, robots and sitemap use verification-safe public data", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const schemaText = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schema = schemaText.join("\n");
  expect(schema).toContain("Organization");
  expect(schema).toContain("Opplexify LLC");
  expect(schema).toContain(companyEmail);
  expect(schema).toContain(companyPhone);
  expect(schema).toContain(companyLinkedIn);
  expect(schema).not.toContain("LocalBusiness");
  expect(schema).not.toContain("ProfessionalService");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const robotsText = await robots.text();
  expect(robotsText).toContain("Sitemap:");
  expect(robotsText).toContain("Disallow: /team");
  expect(robotsText).toContain("Disallow: /work");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://opplexify.com/services/custom-website-development");
  expect(sitemapText).not.toContain("/team");
  expect(sitemapText).not.toContain("/work");
});

async function assertPortfolioExperience(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto("/portfolio", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".loader-wrap")).toHaveCount(0);
  await expect(page.locator("body")).toContainText("Selected private client work is available upon request");
  await expect(page.locator("body")).not.toContainText(/Portfolio Visual|Website Client|SaaS Founder|4K visuals/i);
  await assertNoHorizontalOverflow(page);

  const filterButtons = page.locator(".portfolio-filter-bar button");
  await expect(filterButtons.first()).toHaveText("All");
  await expect(filterButtons.first()).toHaveAttribute("aria-pressed", "true");

  const cards = page.locator(".opplexify-portfolio-wrapper-box .card-wrap, .portfolio-editorial-card");
  await expect.poll(async () => cards.count(), { timeout: 10_000 }).toBeGreaterThan(0);

  const firstImageLoaded = await cards
    .first()
    .locator("img")
    .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0);
  expect(firstImageLoaded).toBeTruthy();

  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
  );
  expect(brokenImages).toEqual([]);
}

test("portfolio grid uses neutral labels across viewports", async ({ page }) => {
  for (const viewport of viewports) {
    await assertPortfolioExperience(page, { width: viewport.width, height: viewport.height });
  }
});

test("contact form submits and creates an admin-visible message", async ({ page, request, browserName }) => {
  test.skip(browserName !== "chromium", "Contact storage QA runs once to avoid duplicate test messages.");

  const stamp = Date.now();
  const subject = `QA Test Contact ${stamp}`;
  const email = `qa-${stamp}@example.com`;

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#contact__form")).toBeVisible();

  await page.locator('#contact__form input[name="name"]').fill("QA Test User");
  await page.locator('#contact__form input[name="email"]').fill(email);
  await page.locator('#contact__form input[name="phone"]').fill("+1 307 443 5144");
  await page.locator('#contact__form input[name="subject"]').fill(subject);
  await page.locator('#contact__form textarea[name="message"]').fill("QA Test message submitted through the Playwright contact form.");

  const contactResponse = page.waitForResponse((response) => response.url().includes("/public/contact") && response.request().method() === "POST");
  await page.locator("#contact__form").evaluate((form: HTMLFormElement) => form.requestSubmit());
  expect((await contactResponse).ok()).toBeTruthy();
  await expect(page.locator("#contact__form .notice")).toContainText("Message sent");

  const login = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  expect(login.ok()).toBeTruthy();
  const { accessToken } = (await login.json()) as { accessToken: string };

  const list = await request.get(`${API_BASE_URL}/admin/contact-messages?limit=100`, {
    headers: authHeaders(accessToken)
  });
  expect(list.ok()).toBeTruthy();
  const payload = (await list.json()) as { items: Array<{ id: string; subject?: string; email?: string }> };
  const message = payload.items.find((item) => item.subject === subject && item.email === email);
  expect(message).toBeTruthy();

  if (message?.id) {
    const cleanup = await request.delete(`${API_BASE_URL}/admin/contact-messages/${message.id}`, {
      headers: authHeaders(accessToken)
    });
    expect(cleanup.ok()).toBeTruthy();
  }
});
