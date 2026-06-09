import assert from "node:assert/strict";
import test from "node:test";
import { createSitemap } from "../src/sitemap.ts";

test("createSitemap resolves relative paths", () => {
  const sitemap = createSitemap({
    baseUrl: "https://afenda.example",
    entries: [
      {
        path: "/",
        lastModified: new Date("2026-06-09T00:00:00.000Z"),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        path: "/about",
        lastModified: "2026-06-08T00:00:00.000Z",
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ],
  });

  assert.deepEqual(sitemap, [
    {
      url: "https://afenda.example/",
      lastModified: new Date("2026-06-09T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://afenda.example/about",
      lastModified: "2026-06-08T00:00:00.000Z",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]);
});

test("createSitemap resolves alternates against the base url", () => {
  const sitemap = createSitemap({
    baseUrl: "https://afenda.example",
    entries: [
      {
        path: "/",
        alternates: {
          languages: {
            en: "/",
            th: "/th",
          },
        },
      },
    ],
  });

  assert.deepEqual(sitemap[0]?.alternates, {
    languages: {
      en: "https://afenda.example/",
      th: "https://afenda.example/th",
    },
  });
});
