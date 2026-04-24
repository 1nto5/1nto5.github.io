import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://adrianantosiak.pl",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  i18n: {
    defaultLocale: "pl",
    locales: ["pl", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "pl",
        locales: {
          pl: "pl-PL",
          en: "en-US",
        },
      },
    }),
  ],
});
