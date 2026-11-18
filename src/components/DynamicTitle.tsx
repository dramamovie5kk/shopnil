import { socialMetadata } from "@/lib/socialMetadata";
import { updateFavicon } from "@/lib/favicon";
import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const updateMetaTag = (property: string, content: string, isName = false) => {

  const attr = isName ? "name" : "property";
  let tag = document.querySelector(`meta[${attr}="${property}"]`);
  if (!content) { tag?.remove(); return; }
  if (tag) {
    tag.setAttribute("content", content);
  } else {
    tag = document.createElement("meta");
    tag.setAttribute(attr, property);
    tag.setAttribute("content", content);
    document.head.appendChild(tag);
  }
};

const DynamicTitle = () => {
  const { getSetting, settings, isLoading } = useSiteSettings();
  const favicon = getSetting("site_favicon_url", "");
  const faviconVersion = settings.find(setting => setting.setting_key === "site_favicon_url")?.updated_at || "";
  useEffect(() => { updateFavicon(favicon, faviconVersion); }, [favicon, faviconVersion]);
  const tabTitle = getSetting("site_name", "Baridhara").trim() || "Baridhara";
  const ogTitle = getSetting("og_title", "");
  const ogDescription = getSetting("og_description", "");
  const meta = socialMetadata(Object.fromEntries(settings.map(s => [s.setting_key, s.setting_value || ""])), window.location.href);
  const ogImage = meta.image;

  useEffect(() => {
    if (isLoading) return;
    if (tabTitle) {
      document.title = tabTitle;
    }

    // OG meta tags
    const titleToUse = ogTitle || tabTitle;
    if (titleToUse) {
      updateMetaTag("og:title", titleToUse);
      updateMetaTag("twitter:title", titleToUse, true);
    }

    if (ogDescription) {
      updateMetaTag("description", ogDescription, true);
      updateMetaTag("og:description", ogDescription);
      updateMetaTag("twitter:description", ogDescription, true);
    }

    {
      updateMetaTag("og:image", ogImage);
      updateMetaTag("twitter:image", ogImage, true);
    }
  }, [tabTitle, ogTitle, ogDescription, ogImage, isLoading]);

  return null;
};

export default DynamicTitle;
