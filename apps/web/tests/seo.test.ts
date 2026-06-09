import assert from "node:assert/strict";
import test from "node:test";
import {
  webHomeMetadata,
  webLayoutMetadata,
  webRobots,
  webSitemap,
} from "../app/seo.ts";

test("web app SEO output is wired to the shared preset", () => {
  const layoutIcons = webLayoutMetadata.icons as { icon?: string } | undefined;
  const pageImages = webHomeMetadata.openGraph?.images as
    | Array<{ url: string }>
    | undefined;

  assert.equal(webLayoutMetadata.title, "XForge Web | XForge");
  assert.equal(layoutIcons?.icon, "/icon.svg");
  assert.equal(webHomeMetadata.title, "XForge | XForge");
  assert.equal(pageImages?.[0]?.url, "/opengraph-image");
});

test("web robots and sitemap are public-facing", () => {
  const robotsOutput = webRobots;
  const sitemapOutput = webSitemap;

  assert.deepEqual(robotsOutput.rules, {
    userAgent: "*",
    allow: "/",
  });
  assert.equal(robotsOutput.sitemap, "http://localhost:3001/sitemap.xml");
  assert.deepEqual(sitemapOutput, [
    {
      url: "http://localhost:3001/",
      changeFrequency: "weekly",
      priority: 1,
    },
  ]);
});
