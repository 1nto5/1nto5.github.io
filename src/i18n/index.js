import pl from "./pl.json";
import en from "./en.json";

const DICT = { pl, en };

export function getTranslations(locale) {
  return DICT[locale] ?? DICT.pl;
}

export const LOCALES = ["pl", "en"];
export const DEFAULT_LOCALE = "pl";

export function getMeta(locale) {
  if (locale === "en") {
    return {
      lang: "en",
      htmlLang: "en-US",
      ogLocale: "en_US",
      ogLocaleAlternate: "pl_PL",
      path: "/en/",
      title: "Adrian Antosiak - AI, Apps, Web, IT | Independent Consultant",
      description:
        "Independent consultant based in Szczytno, Poland. AI for business, custom applications, websites and online stores, IT support. Serving Poland and remote worldwide.",
      ogImageAlt: "Adrian Antosiak - AI, Apps, Web, IT",
    };
  }
  return {
    lang: "pl",
    htmlLang: "pl-PL",
    ogLocale: "pl_PL",
    ogLocaleAlternate: "en_US",
    path: "/",
    title: "Adrian Antosiak - AI, aplikacje, strony, IT | Niezależny konsultant",
    description:
      "Niezależny konsultant ze Szczytna (Warmia-Mazury). Wdrożenia AI dla firm, aplikacje szyte na miarę, strony i sklepy internetowe, wsparcie IT. Polska i zdalnie na świecie.",
    ogImageAlt: "Adrian Antosiak - AI, aplikacje, strony, IT",
  };
}
