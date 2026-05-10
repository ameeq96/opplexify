"use client";

import { useEffect } from "react";
import { TEMPLATE_ASSET_BASE, templateScriptFiles } from "./templateAssets";

declare global {
  interface Window {
    ScrollTrigger?: { refresh?: () => void };
    ScrollSmoother?: {
      create?: (options: Record<string, unknown>) => unknown;
      get?: () => { kill?: () => void } | undefined;
    };
    __opplexifyDigitalAgencyScripts?: Set<string>;
  }
}

function findLoadedScript(src: string) {
  return Array.from(document.scripts).find((script) => script.src.endsWith(src));
}

function loadTemplateScript(file: string) {
  const src = `${TEMPLATE_ASSET_BASE}/js/${file}`;
  const existing = findLoadedScript(src);

  if (existing || window.__opplexifyDigitalAgencyScripts?.has(file)) {
    window.__opplexifyDigitalAgencyScripts?.add(file);
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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

function dismissStaleLoader(delay = 4200) {
  return window.setTimeout(() => {
    const loader = document.querySelector<HTMLElement>(".loader-wrap");
    if (!loader) return;

    loader.style.transition = "opacity 280ms ease, visibility 280ms ease";
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";

    window.setTimeout(() => {
      loader.remove();
    }, 320);
  }, delay);
}

export function DigitalAgencyRuntime({ bodyClassName = "body-digital-agency", smooth = true }: DigitalAgencyRuntimeProps) {
  useEffect(() => {
    let mounted = true;
    let cursorObserver: MutationObserver | undefined;
    let refreshTimeout: number | undefined;
    let loaderFallbackTimeout: number | undefined;
    const bodyClasses = ["body-wrapper", "dark", ...bodyClassName.split(" ").filter(Boolean)];

    window.__opplexifyDigitalAgencyScripts ??= new Set<string>();
    document.body.classList.add(...bodyClasses);

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
    const hadMainScript = Boolean(findLoadedScript(`${TEMPLATE_ASSET_BASE}/js/main.js`)) || window.__opplexifyDigitalAgencyScripts.has("main.js");
    loaderFallbackTimeout = dismissStaleLoader(hadMainScript ? 700 : 4200);

    templateScriptFiles
      .reduce((promise, file) => promise.then(() => loadTemplateScript(file)), Promise.resolve())
      .then(() => {
        if (!mounted) return;

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
      cursorObserver?.disconnect();
      document.body.classList.remove(...bodyClasses);
    };
  }, [bodyClassName, smooth]);

  return null;
}
