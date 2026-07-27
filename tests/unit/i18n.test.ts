import { describe, expect, it } from "vitest";
import { getDictionary, SUPPORTED_LOCALES, t } from "@/lib/i18n/dictionaries";

describe("i18n", () => {
  it("translates known keys per locale", () => {
    expect(t("app.name", "en")).toBe("CarePulse");
    expect(t("nav.appointments", "en")).toBe("Appointments");
    expect(t("nav.appointments", "es")).toBe("Citas");
    expect(t("nav.appointments", "fr")).toBe("Rendez-vous");
    expect(t("status.cancelled", "es")).toBe("Cancelada");
  });

  it("falls back to English then key", () => {
    expect(t("nav.dashboard", "es")).toBe("Panel");
    expect(t("missing.key.xyz", "en")).toBe("missing.key.xyz");
  });

  it("exposes dictionaries for supported locales", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "es", "fr"]);
    for (const locale of SUPPORTED_LOCALES) {
      const dict = getDictionary(locale);
      expect(dict["app.name"]).toBe("CarePulse");
    }
  });
});
