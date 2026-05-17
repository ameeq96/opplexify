import { API_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, adminToken, assertNoHorizontalOverflow, authHeaders, expect, test, waitForApi } from "./fixtures";
import type { APIRequestContext } from "@playwright/test";

const publicApiPaths = [
  "/public/site",
  "/public/pages/home",
  "/public/services",
  "/public/projects",
  "/public/blog",
  "/public/team",
  "/public/faqs",
  "/public/testimonials"
];

const dashboardStats = [
  "services",
  "projects",
  "portfolioItems",
  "posts",
  "messages",
  "pages",
  "media",
  "unreadMessages",
  "draftPosts"
];

const adminResources = [
  { key: "settings", label: "Global Settings" },
  { key: "menus", label: "Menus" },
  { key: "menu-items", label: "Menu Items" },
  { key: "pages", label: "Pages CMS" },
  { key: "page-sections", label: "Page Sections" },
  { key: "services", label: "Services" },
  { key: "project-categories", label: "Project Categories" },
  { key: "projects", label: "Portfolio/Work" },
  { key: "blog-categories", label: "Blog Categories" },
  { key: "tags", label: "Tags" },
  { key: "blog-posts", label: "Blog" },
  { key: "team", label: "Team" },
  { key: "faqs", label: "FAQ" },
  { key: "testimonials", label: "Testimonials" },
  { key: "contact-messages", label: "Contact Messages" },
  { key: "media", label: "Media Library" },
  { key: "users", label: "Users & Roles" }
];

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ request, browserName }) => {
  test.skip(browserName !== "chromium", "Admin/API mutation QA runs once in Chromium.");
  await waitForApi(request);
});

test("public API, Swagger and auth boundaries respond correctly", async ({ request }) => {
  const health = await request.get(`${API_BASE_URL}/health`);
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ ok: true, service: "opplexify-api" });

  for (const path of publicApiPaths) {
    const response = await request.get(`${API_BASE_URL}${path}`);
    expect(response.ok(), `${path} should return OK`).toBeTruthy();
  }

  const swagger = await request.get(`${API_BASE_URL}/docs`);
  expect(swagger.ok()).toBeTruthy();
  expect(await swagger.text()).toContain("Swagger UI");

  const unauthenticatedAdmin = await request.get(`${API_BASE_URL}/admin/dashboard`);
  expect(unauthenticatedAdmin.status()).toBe(401);

  const login = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  expect(login.ok()).toBeTruthy();
  const loginPayload = (await login.json()) as { accessToken?: string };
  expect(loginPayload.accessToken).toBeTruthy();
});

test("admin login and every CMS module opens in the dashboard", async ({ page }) => {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  const loginResponse = page.waitForResponse((response) => response.url().includes("/auth/login") && response.request().method() === "POST");
  await page.getByRole("button", { name: /sign in/i }).click();
  expect((await loginResponse).ok()).toBeTruthy();
  await page.waitForFunction(() => Boolean(localStorage.getItem("opplexify_token")));

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Opplexify CMS")).toBeVisible();
  await expect(page.locator(".admin-card")).toHaveCount(dashboardStats.length);

  for (const resource of adminResources) {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/admin/${resource.key}?`) &&
        response.request().method() === "GET" &&
        response.status() < 400
    );

    await page.getByRole("button", { name: resource.label, exact: true }).click();
    await responsePromise;
    await expect(page.locator(".admin-table")).toBeVisible();
  }

  await page.getByRole("button", { name: "Menu Items", exact: true }).click();
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.locator(".admin-form-grid").getByRole("combobox", { name: "Menu", exact: true })).toContainText("Header Navigation");

  await page.getByRole("button", { name: "Pages CMS", exact: true }).click();
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.locator(".media-field select").first()).toContainText(/portfolio|logo|Media library/i);
});

test("admin mobile dashboard keeps navigation, forms, media picker and repeaters within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await assertNoHorizontalOverflow(page);
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  const loginResponse = page.waitForResponse((response) => response.url().includes("/auth/login") && response.request().method() === "POST");
  await page.getByRole("button", { name: /sign in/i }).click();
  expect((await loginResponse).ok()).toBeTruthy();
  await page.waitForFunction(() => Boolean(localStorage.getItem("opplexify_token")));

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Opplexify CMS")).toBeVisible();
  await expect(page.locator(".admin-sidebar")).toBeVisible();
  await expect
    .poll(() => page.locator(".admin-sidebar").evaluate((element) => element.scrollWidth > element.clientWidth))
    .toBe(true);
  await assertNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Pages CMS", exact: true }).click();
  await expect(page.locator(".admin-table")).toBeVisible();
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.locator(".media-field").first()).toBeVisible();
  await expect(page.locator(".media-picker-row").first()).toBeVisible();
  await assertNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Page Sections", exact: true }).click();
  await expect(page.locator(".admin-table")).toBeVisible();
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.locator(".admin-form-grid").getByRole("combobox", { name: "Page", exact: true })).toContainText(/Home|About|Portfolio/i);
  await page.locator(".admin-form-grid").getByRole("combobox", { name: "Type", exact: true }).selectOption("pricing");
  const pricingRepeater = page.locator(".repeater").filter({ hasText: "Pricing cards" });
  await expect(pricingRepeater).toBeVisible();
  await pricingRepeater.getByRole("button", { name: /add/i }).click();
  await expect(pricingRepeater.locator(".repeater-item")).toBeVisible();
  await assertNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Portfolio Gallery", exact: true }).click();
  await expect(page.locator(".admin-table")).toBeVisible();
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.locator(".media-field").first()).toBeVisible();
  await assertNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Media Library", exact: true }).click();
  await expect(page.locator('input[type="file"]')).toBeVisible();
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(page.locator(".admin-form-grid")).toBeVisible();
  await assertNoHorizontalOverflow(page);
});

test("admin search, filters, pagination and lead notes work in the dashboard", async ({ page, request }) => {
  const token = await adminToken(request);
  await page.addInitScript((accessToken) => {
    localStorage.setItem("opplexify_token", accessToken);
  }, token);

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Opplexify CMS")).toBeVisible();

  await page.getByLabel("Rows").selectOption("10");
  await page.getByLabel("Search records").fill("home");
  const pageSearchResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/admin/pages?") &&
      response.url().includes("q=home") &&
      response.request().method() === "GET"
  );
  await page.getByRole("button", { name: "Search", exact: true }).click();
  expect((await pageSearchResponse).ok()).toBeTruthy();
  await expect(page.locator(".admin-table")).toContainText(/Home/i);

  const statusResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/admin/pages?") &&
      response.url().includes("status=PUBLISHED") &&
      response.request().method() === "GET"
  );
  await page.getByLabel("Status").selectOption("PUBLISHED");
  expect((await statusResponse).ok()).toBeTruthy();
  await expect(page.locator(".admin-pagination")).toContainText(/Page 1 of/i);
  await assertNoHorizontalOverflow(page);

  const portfolioLimitResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/admin/portfolio-items?") &&
      response.url().includes("limit=10") &&
      response.request().method() === "GET"
  );
  await page.getByRole("button", { name: "Portfolio Gallery", exact: true }).click();
  expect((await portfolioLimitResponse).ok()).toBeTruthy();
  await expect(page.locator(".admin-pagination")).toContainText(/Page 1 of/i);
  const nextButton = page.locator(".admin-pagination").getByRole("button", { name: "Next", exact: true });
  if (await nextButton.isEnabled()) {
    const nextResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/admin/portfolio-items?") &&
        response.url().includes("page=2") &&
        response.request().method() === "GET"
    );
    await nextButton.click();
    expect((await nextResponse).ok()).toBeTruthy();
    await expect(page.locator(".admin-pagination")).toContainText(/Page 2 of/i);
  }

  const suffix = Date.now();
  const subject = `QA Admin Lead ${suffix}`;
  const email = `qa-admin-${suffix}@example.com`;
  const note = `Reviewed by dashboard QA ${suffix}`;
  const created = await request.post(`${API_BASE_URL}/public/contact`, {
    data: {
      name: "QA Admin Lead",
      email,
      phone: "+1 555 0166",
      subject,
      message: "QA lead message created to verify admin notes and status editing."
    }
  });
  expect(created.ok()).toBeTruthy();

  const headers = authHeaders(token);
  const list = await request.get(`${API_BASE_URL}/admin/contact-messages?q=${encodeURIComponent(subject)}&limit=10`, {
    headers
  });
  expect(list.ok()).toBeTruthy();
  const listPayload = (await list.json()) as { items: Array<{ id: string; subject?: string }> };
  const message = listPayload.items.find((item) => item.subject === subject);
  const messageId = message?.id;
  expect(messageId).toBeTruthy();

  try {
    await page.getByRole("button", { name: "Contact Messages", exact: true }).click();
    await page.getByLabel("Search records").fill(subject);
    const leadSearchResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/admin/contact-messages?") &&
        response.url().includes("q=QA") &&
        response.request().method() === "GET"
    );
    await page.getByRole("button", { name: "Search", exact: true }).click();
    expect((await leadSearchResponse).ok()).toBeTruthy();
    await expect(page.locator(".admin-table")).toContainText(messageId!);

    await page.getByRole("button", { name: /edit/i }).first().click();
    await page.locator(".admin-form-grid").getByRole("combobox", { name: "Status", exact: true }).selectOption("read");
    await page.locator(".admin-form-grid").getByRole("textbox", { name: "Admin Notes", exact: true }).fill(note);
    const patchResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/admin/contact-messages/${messageId}`) &&
        response.request().method() === "PATCH"
    );
    await page.getByRole("button", { name: "Save", exact: true }).click();
    expect((await patchResponse).ok()).toBeTruthy();

    const updated = await request.get(`${API_BASE_URL}/admin/contact-messages?q=${encodeURIComponent(subject)}&limit=10`, {
      headers
    });
    expect(updated.ok()).toBeTruthy();
    const updatedPayload = (await updated.json()) as { items: Array<{ id: string; status?: string; adminNotes?: string }> };
    const updatedMessage = updatedPayload.items.find((item) => item.id === messageId);
    expect(updatedMessage?.status).toBe("read");
    expect(updatedMessage?.adminNotes).toBe(note);
  } finally {
    if (messageId) {
      const cleanup = await request.delete(`${API_BASE_URL}/admin/contact-messages/${messageId}`, { headers });
      expect(cleanup.ok()).toBeTruthy();
    }
  }
});

test("admin edits structured home CMS data and public home reflects it", async ({ request, page }) => {
  const token = await adminToken(request);
  const headers = authHeaders(token);
  const suffix = Date.now();
  const heroTitle = `QA Dynamic Hero ${suffix}`;
  const pricingTitle = `QA Dynamic Pricing ${suffix}`;
  const serviceTitle = `QA Dynamic Service ${suffix}`;

  const publicHome = await request.get(`${API_BASE_URL}/public/pages/home`);
  expect(publicHome.ok()).toBeTruthy();
  const homePage = (await publicHome.json()) as {
    sections: Array<{ id: string; key: string; title?: string; subtitle?: string; content?: Record<string, unknown> }>;
  };
  const hero = homePage.sections.find((section) => section.key === "hero");
  const pricing = homePage.sections.find((section) => section.key === "pricing");
  expect(hero?.id).toBeTruthy();
  expect(pricing?.id).toBeTruthy();

  const services = await request.get(`${API_BASE_URL}/admin/services?limit=100`, { headers });
  expect(services.ok()).toBeTruthy();
  const servicePayload = (await services.json()) as { items: Array<{ id: string; title: string }> };
  const service = servicePayload.items[0]!;
  expect(service?.id).toBeTruthy();

  try {
    const heroPatch = await request.patch(`${API_BASE_URL}/admin/page-sections/${hero!.id}`, {
      headers,
      data: {
        title: heroTitle,
        subtitle: `QA Dynamic Subtitle ${suffix}`,
        content: {
          ...(hero!.content ?? {}),
          headline: heroTitle,
          metaItems: [`QA meta ${suffix}`, "Admin editable homepage"]
        }
      }
    });
    expect(heroPatch.ok()).toBeTruthy();

    const pricingPatch = await request.patch(`${API_BASE_URL}/admin/page-sections/${pricing!.id}`, {
      headers,
      data: {
        title: pricingTitle,
        content: {
          ...(pricing!.content ?? {}),
          items: [
            {
              label: "QA Package",
              title: `QA CMS Package ${suffix}`,
              description: "QA package proves pricing cards are CMS editable.",
              price: "$77",
              suffix: "test",
              timeline: "1 day",
              features: ["Admin editable pricing"],
              ctaLabel: "Request Package",
              href: "/contact"
            }
          ]
        }
      }
    });
    expect(pricingPatch.ok()).toBeTruthy();

    const servicePatch = await request.patch(`${API_BASE_URL}/admin/services/${service.id}`, {
      headers,
      data: { title: serviceTitle }
    });
    expect(servicePatch.ok()).toBeTruthy();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(heroTitle);
    await expect(page.locator("body")).toContainText(pricingTitle);
    await expect(page.locator("body")).toContainText(serviceTitle);
  } finally {
    if (hero?.id) {
      await request.patch(`${API_BASE_URL}/admin/page-sections/${hero.id}`, {
        headers,
        data: { title: hero.title, subtitle: hero.subtitle, content: hero.content ?? {} }
      });
    }
    if (pricing?.id) {
      await request.patch(`${API_BASE_URL}/admin/page-sections/${pricing.id}`, {
        headers,
        data: { title: pricing.title, subtitle: pricing.subtitle, content: pricing.content ?? {} }
      });
    }
    if (service?.id) {
      await request.patch(`${API_BASE_URL}/admin/services/${service.id}`, {
        headers,
        data: { title: service.title }
      });
    }
  }
});

test("admin settings update public header, footer, contact and social data", async ({ request, page }) => {
  const token = await adminToken(request);
  const headers = authHeaders(token);
  const suffix = Date.now();

  const settingsResponse = await request.get(`${API_BASE_URL}/admin/settings?limit=100`, { headers });
  expect(settingsResponse.ok()).toBeTruthy();
  const settingsPayload = (await settingsResponse.json()) as {
    items: Array<{ id: string; key: string; value: Record<string, unknown> }>;
  };
  const site = settingsPayload.items.find((item) => item.key === "site");
  const social = settingsPayload.items.find((item) => item.key === "social");
  const footer = settingsPayload.items.find((item) => item.key === "footer");
  expect(site?.id).toBeTruthy();
  expect(social?.id).toBeTruthy();
  expect(footer?.id).toBeTruthy();

  const email = `qa-settings-${suffix}@example.com`;
  const phone = `+1 555 ${String(suffix).slice(-4)}`;
  const address = `QA Remote Studio ${suffix}`;
  const footerHeadline = `QA Footer ${suffix}`;
  const linkedin = `https://www.linkedin.com/company/opplexify-qa-${suffix}`;

  try {
    const sitePatch = await request.patch(`${API_BASE_URL}/admin/settings/${site!.id}`, {
      headers,
      data: { value: { ...(site!.value ?? {}), email, phone, address } }
    });
    expect(sitePatch.ok()).toBeTruthy();

    const socialPatch = await request.patch(`${API_BASE_URL}/admin/settings/${social!.id}`, {
      headers,
      data: { value: { ...(social!.value ?? {}), linkedin } }
    });
    expect(socialPatch.ok()).toBeTruthy();

    const footerPatch = await request.patch(`${API_BASE_URL}/admin/settings/${footer!.id}`, {
      headers,
      data: { value: { ...(footer!.value ?? {}), headline: footerHeadline } }
    });
    expect(footerPatch.ok()).toBeTruthy();

    const publicSite = await request.get(`${API_BASE_URL}/public/site`);
    expect(publicSite.ok()).toBeTruthy();
    const publicPayload = (await publicSite.json()) as { settings: Record<string, Record<string, string>> };
    expect(publicPayload.settings.site.email).toBe(email);
    expect(publicPayload.settings.site.phone).toBe(phone);
    expect(publicPayload.settings.site.address).toBe(address);
    expect(publicPayload.settings.social.linkedin).toBe(linkedin);
    expect(publicPayload.settings.footer.headline).toBe(footerHeadline);

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(email);
    await expect(page.locator("body")).toContainText(phone);
    await expect(page.locator("body")).toContainText(address);

    await page.goto("/work", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(footerHeadline);
  } finally {
    if (site?.id) {
      await request.patch(`${API_BASE_URL}/admin/settings/${site.id}`, { headers, data: { value: site.value ?? {} } });
    }
    if (social?.id) {
      await request.patch(`${API_BASE_URL}/admin/settings/${social.id}`, { headers, data: { value: social.value ?? {} } });
    }
    if (footer?.id) {
      await request.patch(`${API_BASE_URL}/admin/settings/${footer.id}`, { headers, data: { value: footer.value ?? {} } });
    }
  }
});

test("admin API create, edit and delete smoke records for safe CMS modules", async ({ request }) => {
  const token = await adminToken(request);
  const suffix = Date.now();

  await createPatchDelete(request, token, "services", {
    create: {
      title: `QA Test Service ${suffix}`,
      slug: `qa-test-service-${suffix}`,
      shortDescription: "QA Test short service description.",
      description: "QA Test service description for Playwright CRUD verification.",
      gallery: [],
      featured: false,
      sortOrder: 999,
      status: "DRAFT"
    },
    patch: { title: `QA Test Service Updated ${suffix}` }
  });

  await createPatchDelete(request, token, "faqs", {
    create: {
      question: `QA Test question ${suffix}?`,
      answer: "QA Test answer created by Playwright and long enough for validation.",
      category: "QA",
      sortOrder: 999,
      isActive: false
    },
    patch: { answer: "QA Test answer updated by Playwright." }
  });

  await createPatchDelete(request, token, "testimonials", {
    create: {
      clientName: `QA Test Client ${suffix}`,
      position: "QA Lead",
      company: "Opplexify QA",
      rating: 5,
      reviewText: "QA Test testimonial created by Playwright for admin CRUD verification.",
      sortOrder: 999,
      isActive: false
    },
    patch: { company: "Opplexify QA Updated" }
  });
});

async function createPatchDelete(
  request: APIRequestContext,
  token: string,
  resource: string,
  data: { create: Record<string, unknown>; patch: Record<string, unknown> }
) {
  const headers = authHeaders(token);
  const created = await request.post(`${API_BASE_URL}/admin/${resource}`, {
    headers,
    data: data.create
  });
  expect(created.ok(), `${resource} create should succeed`).toBeTruthy();
  const createdItem = (await created.json()) as { id?: string };
  expect(createdItem.id, `${resource} create should return an id`).toBeTruthy();

  const updated = await request.patch(`${API_BASE_URL}/admin/${resource}/${createdItem.id}`, {
    headers,
    data: data.patch
  });
  expect(updated.ok(), `${resource} update should succeed`).toBeTruthy();

  const removed = await request.delete(`${API_BASE_URL}/admin/${resource}/${createdItem.id}`, {
    headers
  });
  expect(removed.ok(), `${resource} delete should succeed`).toBeTruthy();

  const list = await request.get(`${API_BASE_URL}/admin/${resource}?limit=100`, { headers });
  expect(list.ok(), `${resource} list should succeed after delete`).toBeTruthy();
  const listPayload = (await list.json()) as { items: Array<{ id: string }> };
  expect(listPayload.items.some((item) => item.id === createdItem.id), `${resource} deleted item should not appear in admin list`).toBe(false);
}
