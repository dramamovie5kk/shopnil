import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

declare global {
  interface Window {
    dataLayer: any[];
    fbq: (...args: any[]) => void;
    ttq: any;
  }
}

const CustomCodeInjector = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const headerCode = settings.find((s) => s.setting_key === "header_code")?.setting_value;
    const bodyCode = settings.find((s) => s.setting_key === "body_code")?.setting_value;
    const footerCode = settings.find((s) => s.setting_key === "footer_code")?.setting_value;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Inject header code
    injectCode(headerCode, "custom-header-code", "head");

    // Inject body code (after body tag)
    injectCode(bodyCode, "custom-body-code", "body-start");

    // Inject footer code (before body end)
    injectCode(footerCode, "custom-footer-code", "body-end");
  }, [settings]);

  const injectCode = (
    code: string | null | undefined,
    id: string,
    position: "head" | "body-start" | "body-end"
  ) => {
    if (!code) return;

    // Remove existing if any
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const existingNoscript = document.getElementById(`${id}-noscript`);
    if (existingNoscript) existingNoscript.remove();

    const container = document.createElement("div");
    container.innerHTML = code;

    // Extract and execute scripts
    const scripts = container.getElementsByTagName("script");
    Array.from(scripts).forEach((script) => {
      const newScript = document.createElement("script");
      newScript.id = id;
      if (script.src) {
        newScript.src = script.src;
        newScript.async = true;
      } else {
        newScript.textContent = script.textContent;
      }

      if (position === "head") {
        document.head.appendChild(newScript);
      } else {
        document.body.appendChild(newScript);
      }
    });

    // Handle non-script content (noscript, iframes, etc.)
    const nonScriptContent = code.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
    if (nonScriptContent) {
      const nonScriptContainer = document.createElement("div");
      nonScriptContainer.id = `${id}-noscript`;
      nonScriptContainer.innerHTML = nonScriptContent;

      if (position === "head") {
        document.head.appendChild(nonScriptContainer);
      } else if (position === "body-start") {
        document.body.insertBefore(nonScriptContainer, document.body.firstChild);
      } else {
        document.body.appendChild(nonScriptContainer);
      }
    }

    console.log(`[CustomCode] Injected ${id} at ${position}`);
  };

  return null;
};

export default CustomCodeInjector;