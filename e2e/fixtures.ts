import { expect, test as base } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

export const WEB_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
export const API_BASE_URL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:4000";
export const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? "admin@opplexify.local";
export const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "Admin123!";

const internalHosts = new Set([
  new URL(WEB_BASE_URL).host,
  new URL(API_BASE_URL).host,
  "localhost:3000",
  "127.0.0.1:3000",
  "localhost:4000",
  "127.0.0.1:4000"
]);

function isInternalUrl(url: string) {
  try {
    return internalHosts.has(new URL(url).host);
  } catch {
    return false;
  }
}

function isIgnoredConsoleError(text: string) {
  return (
    text.includes("ResizeObserver loop completed with undelivered notifications") ||
    (text.includes("/_next/webpack-hmr") && text.includes("WebSocket connection"))
  );
}

function isIgnoredRequestFailure(failure: string) {
  return (
    failure.includes("ERR_ABORTED") ||
    failure.includes("NS_BINDING_ABORTED") ||
    failure.includes("NS_ERROR_PARSED_DATA_CACHED")
  );
}

async function installQaGuards(page: Page, errors: string[]) {
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (!isIgnoredConsoleError(text)) errors.push(`console error: ${text}`);
  });

  page.on("requestfailed", (request) => {
    if (!isInternalUrl(request.url())) return;
    const failure = request.failure()?.errorText ?? "unknown failure";
    if (isIgnoredRequestFailure(failure)) return;
    errors.push(`request failed: ${request.method()} ${request.url()} ${failure}`);
  });

  page.on("response", (response) => {
    if (!isInternalUrl(response.url())) return;
    if (response.status() >= 400) {
      errors.push(`bad response: ${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });
}

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    await installQaGuards(page, errors);

    await use(page);

    if (errors.length) {
      await testInfo.attach("qa-errors.txt", {
        body: errors.join("\n"),
        contentType: "text/plain"
      });
    }
    expect(errors).toEqual([]);
  }
});

export { expect };

export async function waitForApi(request: APIRequestContext) {
  await expect
    .poll(
      async () => {
        try {
          const response = await request.get(`${API_BASE_URL}/public/site`);
          return response.status();
        } catch {
          return 0;
        }
      },
      { timeout: 60_000, message: "API should be ready" }
    )
    .toBe(200);
}

export async function adminToken(request: APIRequestContext) {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });

  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as { accessToken?: string };
  expect(payload.accessToken).toBeTruthy();
  return payload.accessToken as string;
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function assertNoHorizontalOverflow(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth - root.clientWidth;
        }),
      { timeout: 6_000, message: "Page should settle without horizontal overflow" }
    )
    .toBeLessThanOrEqual(2);
}

export async function assertNoNextOverlay(page: Page) {
  await expect(page.locator("text=/Console Error|Runtime Error|Hydration failed/i")).toHaveCount(0);
}
