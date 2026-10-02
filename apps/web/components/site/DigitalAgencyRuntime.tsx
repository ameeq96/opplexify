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
}

function bindAccessibleSideInfo() {
  const toggle = document.querySelector<HTMLButtonElement>(".side-toggle");
  const panel = document.querySelector<HTMLElement>(".side-info");
  const closeButton = panel?.querySelector<HTMLButtonElement>(".side-info-close");
  const overlay = document.querySelector<HTMLElement>(".offcanvas-overlay");
  if (!toggle || !panel || !closeButton || !overlay) return () => {};

  let lastFocused: HTMLElement | null = null;
  let isOpen = panel.classList.contains("info-open");

  const syncState = () => {
    isOpen = panel.classList.contains("info-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    panel.setAttribute("aria-hidden", String(!isOpen));
    panel.inert = !isOpen;
  };

  const openPanel = () => {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
    panel.classList.add("info-open");
    overlay.classList.add("overlay-open");
    syncState();
    window.requestAnimationFrame(() => closeButton.focus());
  };

  const closePanel = (restoreFocus = true) => {
    panel.classList.remove("info-open");
    overlay.classList.remove("overlay-open");
    syncState();
    if (restoreFocus) (lastFocused ?? toggle).focus();
  };

  const handleToggle = (event: Event) => {
    event.preventDefault();
    openPanel();
  };
  const handleClose = (event: Event) => {
    event.preventDefault();
    closePanel();
  };
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  toggle.addEventListener("click", handleToggle);
  closeButton.addEventListener("click", handleClose);
  overlay.addEventListener("click", handleClose);
  document.addEventListener("keydown", handleKeydown);
  const observer = new MutationObserver(() => syncState());
  observer.observe(panel, { attributes: true, attributeFilter: ["class"] });
  syncState();

  return () => {
    observer.disconnect();
    toggle.removeEventListener("click", handleToggle);
    closeButton.removeEventListener("click", handleClose);
    overlay.removeEventListener("click", handleClose);
    document.removeEventListener("keydown", handleKeydown);
  };
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

// Swap non-critical stylesheets (shipped with media="print" so they do not block
// the first paint) back to media="all" once the page is interactive.
function enableDeferredStyles() {
  document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][data-defer]').forEach((link) => {
    if (link.media !== "all") link.media = "all";
  });
}

function activateDeferredVideo(video: HTMLVideoElement) {
  const source = video.querySelector<HTMLSourceElement>("source[data-src]");
  if (source && !source.getAttribute("src")) {
    source.setAttribute("src", source.dataset.src ?? "");
    video.load();
  }
  if (video.dataset.autoplay !== undefined) void video.play().catch(() => {});
}

function observeDeferredVideos() {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-deferred-video]"));
  if (!videos.length) return () => {};

  if (!("IntersectionObserver" in window)) {
    videos.forEach(activateDeferredVideo);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target as HTMLVideoElement;
        activateDeferredVideo(video);
        observer.unobserve(video);
      });
    },
    { rootMargin: "360px 0px" }
  );

  videos.forEach((video) => observer.observe(video));
  return () => observer.disconnect();
}

export function DigitalAgencyRuntime({ bodyClassName = "body-digital-agency", smooth = true }: DigitalAgencyRuntimeProps) {
  useEffect(() => {
    let mounted = true;
    let cursorObserver: MutationObserver | undefined;
    let refreshTimeout: number | undefined;
    let loaderFallbackTimeout: number | undefined;
    let legacyDelayTimeout: number | undefined;
    let videoDelayTimeout: number | undefined;
    let legacyIdleId: number | undefined;
    let removeLoadListener: (() => void) | undefined;
    let disconnectDeferredVideos: (() => void) | undefined;
    let unbindAccessibleSideInfo: (() => void) | undefined;
    let legacyStarted = false;
    let videosStarted = false;
    const bodyClasses = ["body-wrapper", "dark", ...bodyClassName.split(" ").filter(Boolean)];
    const interactionEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "wheel"];

    window.__opplexifyDigitalAgencyScripts ??= new Set<string>();
    window.__opplexifyDigitalAgencyScriptLoads ??= {};
    document.body.classList.add(...bodyClasses);

    // These preserve native navigation, contact forms and visual styling without
    // waiting for the optional animation/plugin bundle.
    enableDeferredStyles();

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

    const startDeferredVideos = () => {
      if (videosStarted || !mounted) return;
      videosStarted = true;
      if (videoDelayTimeout) window.clearTimeout(videoDelayTimeout);
      disconnectDeferredVideos = observeDeferredVideos();
    };

    const removeInteractionListeners = () => {
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, startLegacyScripts));
    };

    function startLegacyScripts() {
      startDeferredVideos();
      if (legacyStarted) return;
      legacyStarted = true;
      removeInteractionListeners();
      if (legacyDelayTimeout) window.clearTimeout(legacyDelayTimeout);
      if (legacyIdleId !== undefined) {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(legacyIdleId);
      }

      templateScriptFiles
        .reduce((promise, file) => promise.then(() => loadTemplateScript(file)), Promise.resolve())
        .then(() => {
          if (!mounted) return;

          enableDeferredStyles();
          fixCursorPath();
          bindContactForm();
          refreshRuntime();
          refreshTimeout = window.setTimeout(refreshRuntime, 250);
        })
        .catch((error) => {
          if (mounted) console.error(error);
        });
    }

    const scheduleNonCriticalWork = () => {
      videoDelayTimeout = window.setTimeout(startDeferredVideos, 8000);

      legacyDelayTimeout = window.setTimeout(() => {
        const idleWindow = window as Window & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
        };
        if (typeof idleWindow.requestIdleCallback === "function") {
          legacyIdleId = idleWindow.requestIdleCallback(startLegacyScripts, { timeout: 2500 });
        } else {
          startLegacyScripts();
        }
      }, 12000);
    };

    cursorObserver = new MutationObserver(fixCursorPath);
    cursorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-cursor"]
    });

    bindContactForm();
    unbindAccessibleSideInfo = bindAccessibleSideInfo();
    loaderFallbackTimeout = dismissLoader();

    interactionEvents.forEach((eventName) =>
      window.addEventListener(eventName, startLegacyScripts, { once: true, passive: true })
    );

    if (document.readyState === "complete") {
      scheduleNonCriticalWork();
    } else {
      const handleLoad = () => scheduleNonCriticalWork();
      window.addEventListener("load", handleLoad, { once: true });
      removeLoadListener = () => window.removeEventListener("load", handleLoad);
    }

    return () => {
      mounted = false;
      removeInteractionListeners();
      removeLoadListener?.();
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      if (loaderFallbackTimeout) window.clearTimeout(loaderFallbackTimeout);
      if (legacyDelayTimeout) window.clearTimeout(legacyDelayTimeout);
      if (videoDelayTimeout) window.clearTimeout(videoDelayTimeout);
      if (legacyIdleId !== undefined) {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(legacyIdleId);
      }
      disconnectDeferredVideos?.();
      cursorObserver?.disconnect();
      unbindAccessibleSideInfo?.();
      document.body.classList.remove(...bodyClasses);
    };
  }, [bodyClassName, smooth]);

  return null;
}
