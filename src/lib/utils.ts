import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Takes a WhatsApp input (full URL or phone number) and returns a valid WhatsApp URL.
 */
export function getWhatsAppUrl(input: string, message?: string): string {
  if (!input) return "#";
  const trimmed = input.trim();
  
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (message && !trimmed.includes("text=")) {
      const separator = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${separator}text=${encodeURIComponent(message)}`;
    }
    return trimmed;
  }
  
  if (trimmed.startsWith("wa.me/")) {
    const url = `https://${trimmed}`;
    if (message) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}text=${encodeURIComponent(message)}`;
    }
    return url;
  }
  
  let phone = trimmed.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (phone.startsWith("0") && phone.length === 11) phone = `88${phone}`;
  const url = `https://wa.me/${phone}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
