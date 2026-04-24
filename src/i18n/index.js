import pl from "./pl.json";
import en from "./en.json";

const DICT = { pl, en };

export function getTranslations(locale) {
  return DICT[locale] ?? DICT.pl;
}

export const LOCALES = ["pl", "en"];
export const DEFAULT_LOCALE = "pl";

const PAGE_PATHS = {
  home: { pl: "/", en: "/en/" },
  privacy: { pl: "/prywatnosc/", en: "/en/privacy/" },
};

export function getMeta(locale, page = "home") {
  const isEn = locale === "en";
  const paths = PAGE_PATHS[page] ?? PAGE_PATHS.home;
  const localeBase = {
    lang: isEn ? "en" : "pl",
    htmlLang: isEn ? "en-US" : "pl-PL",
    ogLocale: isEn ? "en_US" : "pl_PL",
    ogLocaleAlternate: isEn ? "pl_PL" : "en_US",
    path: isEn ? paths.en : paths.pl,
    altPaths: paths,
  };

  if (page === "privacy") {
    return {
      ...localeBase,
      title: isEn
        ? "Privacy Policy - Adrian Antosiak"
        : "Polityka prywatności - Adrian Antosiak",
      description: isEn
        ? "How personal data is handled on adrianantosiak.pl. No tracking, no analytics, no advertising cookies."
        : "Jak przetwarzane są dane osobowe w serwisie adrianantosiak.pl. Bez śledzenia, bez analityki, bez cookies reklamowych.",
      ogImageAlt: isEn
        ? "Adrian Antosiak - Privacy Policy"
        : "Adrian Antosiak - Polityka prywatności",
    };
  }

  return {
    ...localeBase,
    title: isEn
      ? "Adrian Antosiak - AI, Apps, Web, IT | Independent Consultant"
      : "Adrian Antosiak - AI, aplikacje, strony, IT | Niezależny konsultant",
    description: isEn
      ? "Independent consultant based in Szczytno, Poland. AI for business, custom applications, websites and online stores, IT support. Serving Poland and remote worldwide."
      : "Niezależny konsultant ze Szczytna (Warmia-Mazury). Wdrożenia AI dla firm, aplikacje szyte na miarę, strony i sklepy internetowe, wsparcie IT. Polska i zdalnie na świecie.",
    ogImageAlt: isEn
      ? "Adrian Antosiak - AI, Apps, Web, IT"
      : "Adrian Antosiak - AI, aplikacje, strony, IT",
  };
}
