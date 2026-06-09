import assert from "node:assert/strict";
import test from "node:test";
import { createLocalizedSitemap } from "../src/sitemap.ts";

test("createLocalizedSitemap emits prefix-aware locale alternates", () => {
  const sitemap = createLocalizedSitemap({
    baseUrl: "https://afenda.example",
    defaultLocale: "en",
    locales: ["en", "th"],
    entries: [
      {
        path: "/about",
        changeFrequency: "monthly",
      },
    ],
  });

  assert.deepEqual(sitemap, [
    {
      url: "https://afenda.example/about",
      changeFrequency: "monthly",
      alternates: {
        languages: {
          en: "https://afenda.example/about",
          th: "https://afenda.example/th/about",
        },
      },
    },
  ]);
});
