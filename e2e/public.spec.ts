import { API_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, assertNoHorizontalOverflow, assertNoNextOverlay, authHeaders, expect, test, waitForApi } from "./fixtures";
import type { Page } from "@playwright/test";

const publicRoutes = [
  { path: "/", marker: /Opplexify|SaaS|dashboard/i },
  { path: "/about", marker: /A full-stack development team|websites, Next\.js web apps/i },
  { path: "/portfolio", marker: /4K visuals|Web development portfolio/i },
  { path: "/services", marker: /Web development services|Business Websites/i },
  { path: "/contact", marker: /Hire Opplexify|Development Project Contact/i },
  { path: "/blog", marker: /Web development, SaaS and SEO insights/i },
  { path: "/faq", marker: /Web development FAQ|pricing, timelines and SEO/i },
  { path: "/team", marker: /Full-stack development team/i },
  { path: "/work", marker: /Case studies for websites/i },
  { path: "/portfolio-grid", marker: /4K visuals|Web development portfolio/i },
  { path: "/service", marker: /Web development services|Business Websites/i },
  { path: "/team/ameeq-khan", marker: /Ameeq Khan|Full-Stack Product Lead/i },
  { path: "/team/atiq-khan", marker: /Atiq Khan|SEO Planning/i },
  { path: "/team/emmad-khan", marker: /Emmad Khan|Frontend Design/i }
];

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

test("header, footer and social links are limited to approved navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("header nav.main-menu a:visible")).toHaveText(["Home", "About", "Portfolio", "Services", "Contact Us"]);

  const socialLinks = page.locator(".footer-widget-box", { hasText: "Social" }).locator("a");
  await expect(socialLinks).toContainText(["Instagram", "Facebook", "Twitter", "LinkedIn"]);
  await expect(page.locator("body")).not.toContainText(/Awwwards|Envato|Behance|Dribbble|YouTube/i);
});

async function assertPortfolioExperience(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto("/portfolio", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".loader-wrap")).toHaveCount(0);
  await expect(page.locator(".opplexify-portfolio-hero")).toContainText(/\d+ 4K visuals/);
  const collageImages = page.locator(".opplexify-portfolio-hero__collage img");
  await expect(collageImages).toHaveCount(3);
  const collageImagesLoaded = await collageImages.evaluateAll((images: HTMLImageElement[]) =>
    images.every((image) => image.complete && image.naturalWidth > 0)
  );
  expect(collageImagesLoaded).toBeTruthy();
  await assertNoHorizontalOverflow(page);

  const filterButtons = page.locator(".portfolio-filter-bar button");
  await expect(filterButtons.first()).toHaveText("All");
  await expect(filterButtons.first()).toHaveAttribute("aria-pressed", "true");

  const cards = page.locator(".opplexify-portfolio-wrapper-box .card-wrap");
  await expect(cards).toHaveCount(9);
  await expect(page.locator('[data-image*="33-0041"], [data-image*="33-0042"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/Friends Port|Repo Management/i);

  const firstImageLoaded = await cards
    .first()
    .locator("img")
    .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0);
  expect(firstImageLoaded).toBeTruthy();

  const firstTagButton = filterButtons.nth(1);
  const firstTag = (await firstTagButton.textContent())?.trim() ?? "";
  await firstTagButton.click();
  await expect(firstTagButton).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => cards.count(), { timeout: 10_000 }).toBeGreaterThan(0);
  const hasMismatchedTag = await cards.evaluateAll(
    (nodes, tag) => nodes.some((node) => node.getAttribute("data-tag") !== tag),
    firstTag
  );
  expect(hasMismatchedTag).toBe(false);
  await assertNoHorizontalOverflow(page);

  await filterButtons.first().click();
  await expect(filterButtons.first()).toHaveAttribute("aria-pressed", "true");
  await expect(cards).toHaveCount(9);
  await assertNoHorizontalOverflow(page);
  await page.locator(".portfolio-scroll-pagination").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /load more work/i }).click();
  await expect.poll(async () => cards.count(), { timeout: 15_000 }).toBeGreaterThan(9);
  await assertNoHorizontalOverflow(page);

  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
  );
  expect(brokenImages).toEqual([]);
  await expect(page.locator(".portfolio-video-item video").first()).toBeVisible();
}

test("portfolio grid scroll pagination, filters and media work across viewports", async ({ page }) => {
  for (const viewport of viewports) {
    await assertPortfolioExperience(page, { width: viewport.width, height: viewport.height });
  }
});

test("team portraits render as non-stretched circles on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/team", { waitUntil: "domcontentloaded" });

  const gridPortrait = page.locator(".team-grid .card-media").first();
  await expect(gridPortrait).toBeVisible();
  const gridStyle = await gridPortrait.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const imageStyle = window.getComputedStyle(element.querySelector("img")!);
    return {
      width: rect.width,
      height: rect.height,
      radius: Number.parseFloat(style.borderTopLeftRadius),
      objectFit: imageStyle.objectFit,
      objectPosition: imageStyle.objectPosition
    };
  });
  expect(Math.abs(gridStyle.width - gridStyle.height)).toBeLessThanOrEqual(2);
  expect(gridStyle.radius).toBeGreaterThanOrEqual(gridStyle.width / 2 - 2);
  expect(gridStyle.objectFit).toBe("cover");
  expect(gridStyle.objectPosition).toMatch(/top|0%/i);

  for (const route of ["/team/ameeq-khan", "/team/atiq-khan", "/team/emmad-khan"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const portrait = page.locator(".team-detail-portrait");
    await expect(portrait).toBeVisible();
    const detailStyle = await portrait.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const imageStyle = window.getComputedStyle(element.querySelector("img")!);
      return {
        width: rect.width,
        height: rect.height,
        radius: Number.parseFloat(style.borderTopLeftRadius),
        objectFit: imageStyle.objectFit,
        objectPosition: imageStyle.objectPosition
      };
    });
    expect(Math.abs(detailStyle.width - detailStyle.height)).toBeLessThanOrEqual(2);
    expect(detailStyle.radius).toBeGreaterThanOrEqual(detailStyle.width / 2 - 2);
    expect(detailStyle.objectFit).toBe("cover");
    expect(detailStyle.objectPosition).toMatch(/top|0%/i);
    await assertNoHorizontalOverflow(page);
  }
});

test("contact form submits and creates an admin-visible message", async ({ page, request, browserName }) => {
  test.skip(browserName !== "chromium", "Contact storage QA runs once to avoid duplicate test messages.");

  const stamp = Date.now();
  const subject = `QA Test Contact ${stamp}`;
  const email = `qa-${stamp}@example.com`;

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#contact__form")).toBeVisible();
  await page.waitForFunction(() => Boolean((document.getElementById("contact__form") as HTMLFormElement | null)?.dataset.opplexifyBound));

  await page.locator('#contact__form input[name="name"]').fill("QA Test User");
  await page.locator('#contact__form input[name="email"]').fill(email);
  await page.locator('#contact__form input[name="phone"]').fill("+1 555 0199");
  await page.locator('#contact__form input[name="subject"]').fill(subject);
  await page.locator('#contact__form input[name="message"]').fill("QA Test message submitted through the Playwright contact form.");

  const contactResponse = page.waitForResponse((response) => response.url().includes("/public/contact") && response.request().method() === "POST");
  await page.locator("#contact__form").evaluate((form: HTMLFormElement) => form.requestSubmit());
  expect((await contactResponse).ok()).toBeTruthy();
  await expect(page.locator("#contact__form .ajax-response")).toContainText("Message sent successfully.");

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
