"use client";

import { useEffect } from "react";
import { TEMPLATE_ASSET_BASE, templateScriptFiles, withAssetVersion } from "./templateAssets";

declare global {
  interface Window {
    ScrollTrigger?: { refresh?: () => void };
    ScrollSmoother?: {
      create?: (options: Record<string, unknown>) => unknown;
      get?: () => { kill?: () => void } | undefined;
    };
    __opplexifyDigitalAgencyScripts?: Set<string>;
    __opplexifyDigitalAgencyScriptLoads?: Partial<Record<string, Promise<void>>>;
  }
}

function findLoadedScript(src: string) {
  return Array.from(document.scripts).find((script) => script.src.endsWith(src));
}

function loadTemplateScript(file: string) {
  const src = withAssetVersion(`${TEMPLATE_ASSET_BASE}/js/${file}`);
  const existing = findLoadedScript(src);

  if (existing || window.__opplexifyDigitalAgencyScripts?.has(file)) {
    window.__opplexifyDigitalAgencyScripts?.add(file);
    return Promise.resolve();
  }

  window.__opplexifyDigitalAgencyScriptLoads ??= {};
  if (window.__opplexifyDigitalAgencyScriptLoads[file]) return window.__opplexifyDigitalAgencyScriptLoads[file];

  const loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");

    script.src = src;
    script.async = false;
    script.dataset.opplexifyDigitalAgency = "true";
    script.onload = () => {
      window.__opplexifyDigitalAgencyScripts?.add(file);
      resolve();
    };
    script.onerror = () => reject(new Error(`Unable to load ${src}`));

    document.body.appendChild(script);
  });

  window.__opplexifyDigitalAgencyScriptLoads[file] = loadPromise;
  return loadPromise;
}

type DigitalAgencyRuntimeProps = {
  bodyClassName?: string;
  smooth?: boolean;
};

function bindContactForm() {
  const form = document.getElementById("contact__form") as HTMLFormElement | null;
  if (!form || form.dataset.opplexifyBound === "true") return;

  const messageBox = form.querySelector(".ajax-response") as HTMLElement | null;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const initialButtonHtml = button?.innerHTML;

  const showMessage = (message: string, type: "success" | "error") => {
    if (!messageBox) return;
    messageBox.classList.remove("success-message", "error-message");
    messageBox.classList.add(type === "success" ? "success-message" : "error-message");
    messageBox.textContent = message;
    messageBox.style.display = "block";
    window.setTimeout(() => {
      messageBox.style.display = "none";
      messageBox.classList.remove("success-message", "error-message");
    }, 4000);
  };

  const submitForm = async (event: Event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      subject: String(formData.get("subject") ?? formData.get("solution") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim()
    };

    if (!payload.name || !payload.email || !payload.subject || payload.message.length < 10) {
      showMessage("Please fill in all required fields. Message should be at least 10 characters.", "error");
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
      const response = await fetch(`${apiBase}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Unable to submit message.");

      form.reset();
      showMessage("Message sent successfully.", "success");
    } catch {
      showMessage("Message could not be sent. Please try again.", "error");
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = initialButtonHtml ?? "Submit now";
      }
    }
  };

  form.dataset.opplexifyBound = "true";
  form.addEventListener("submit", submitForm);
  button?.addEventListener("click", (event) => {
    event.preventDefault();
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

function dismissLoader(delay = 0) {
  return window.setTimeout(() => {
    const loader = document.querySelector<HTMLElement>(".loader-wrap");
    if (!loader) return;

    loader.style.transition = "opacity 180ms ease, visibility 180ms ease";
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
    loader.style.pointerEvents = "none";

    window.setTimeout(() => {
      loader.remove();
    }, 220);
  }, delay);
}

// Swap non-critical stylesheets (shipped with media="print" so they don't block
// the first paint) back to media="all" once the page is interactive.
function enableDeferredStyles() {
  document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][data-defer]').forEach((link) => {
    if (link.media !== "all") link.media = "all";
  });
}

// The hero background video ships with no src (preload="none", data-src) so its
// ~2.6MB payload never competes with LCP. Attach + play it once the browser is idle.
function activateHeroVideo() {
  document.querySelectorAll<HTMLVideoElement>("video.hero-video").forEach((video) => {
    const source = video.querySelector<HTMLSourceElement>("source[data-src]");
    if (source && !source.getAttribute("src")) {
      source.setAttribute("src", source.dataset.src ?? "");
      video.load();
    }
    void video.play().catch(() => {});
  });
}

export function DigitalAgencyRuntime({ bodyClassName = "body-digital-agency", smooth = true }: DigitalAgencyRuntimeProps) {
  useEffect(() => {
    let mounted = true;
    let cursorObserver: MutationObserver | undefined;
    let refreshTimeout: number | undefined;
    let loaderFallbackTimeout: number | undefined;
    let cancelHeroActivate: (() => void) | undefined;
    const bodyClasses = ["body-wrapper", "dark", ...bodyClassName.split(" ").filter(Boolean)];

    window.__opplexifyDigitalAgencyScripts ??= new Set<string>();
    window.__opplexifyDigitalAgencyScriptLoads ??= {};
    document.body.classList.add(...bodyClasses);

    // Non-blocking work that should not wait on the heavy template script chain.
    enableDeferredStyles();
    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof idleWindow.requestIdleCallback === "function") {
      const id = idleWindow.requestIdleCallback(activateHeroVideo, { timeout: 2500 });
      cancelHeroActivate = () => idleWindow.cancelIdleCallback?.(id);
    } else {
      const id = window.setTimeout(activateHeroVideo, 1200);
      cancelHeroActivate = () => window.clearTimeout(id);
    }

    const syncSmoother = () => {
      const smoother = window.ScrollSmoother?.get?.();
      if (!smooth) {
        smoother?.kill?.();
        return;
      }

      const canSmooth =
        window.screen.width > 767 && document.querySelector("#has_smooth.has-smooth") && window.ScrollSmoother?.create;

      if (canSmooth && !smoother) {
        window.ScrollSmoother?.create?.({
          smooth: 1.5,
          effects: window.screen.width < 1025 ? false : true,
          smoothTouch: 0.1,
          normalizeScroll: { allowNestedScroll: true },
          ignoreMobileResize: true
        });
      }
    };

    const refreshRuntime = () => {
      syncSmoother();
      window.ScrollTrigger?.refresh?.();
    };

    if (!smooth) {
      window.ScrollSmoother?.get?.()?.kill?.();
    }

    const fixCursorPath = () => {
      const cursorImg = document.getElementById("cursorImg") as HTMLImageElement | null;
      if (!cursorImg) return;

      const src = cursorImg.getAttribute("src") ?? "";
      if (src.startsWith("assets/imgs/cursor/")) {
        cursorImg.src = `${TEMPLATE_ASSET_BASE}/imgs/cursor/cursor-2-xs.svg`;
      }
    };

    cursorObserver = new MutationObserver(fixCursorPath);
    cursorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-cursor"]
    });

    bindContactForm();
    // Content is server-rendered, so the loader only needs to cover the brief
    // hydration gap — dismiss it quickly rather than waiting on the script chain.
    loaderFallbackTimeout = dismissLoader(200);

    templateScriptFiles
      .reduce((promise, file) => promise.then(() => loadTemplateScript(file)), Promise.resolve())
      .then(() => {
        if (!mounted) return;

        if (loaderFallbackTimeout) window.clearTimeout(loaderFallbackTimeout);
        loaderFallbackTimeout = dismissLoader();
        enableDeferredStyles();
        activateHeroVideo();
        fixCursorPath();
        bindContactForm();
        refreshRuntime();
        refreshTimeout = window.setTimeout(refreshRuntime, 250);
      })
      .catch((error) => {
        if (mounted) console.error(error);
      });

    return () => {
      mounted = false;
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      if (loaderFallbackTimeout) window.clearTimeout(loaderFallbackTimeout);
      cancelHeroActivate?.();
      cursorObserver?.disconnect();
      document.body.classList.remove(...bodyClasses);
    };
  }, [bodyClassName, smooth]);

  return null;
}
