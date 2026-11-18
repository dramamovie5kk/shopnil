import { describe, it, expect } from "vitest";
import { normalizePhoneE164, splitName } from "@/lib/fbTracking";

describe("Facebook matching helpers", () => {
  it("converts local BD numbers to country-code format", () => {
    expect(normalizePhoneE164("01712-345678")).toBe("8801712345678");
    expect(normalizePhoneE164("+8801712345678")).toBe("8801712345678");
  });
  it("splits a full name into first and last name", () => {
    expect(splitName("Rahim Uddin Ahmed")).toEqual({ firstName: "Rahim", lastName: "Uddin Ahmed" });
  });
});
