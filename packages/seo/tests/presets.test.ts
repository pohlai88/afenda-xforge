import assert from "node:assert/strict";
import test from "node:test";
import { createAppSitePreset, createWebSitePreset } from "../src/presets.ts";

test("createWebSitePreset resolves web-specific defaults", () => {
  const preset = createWebSitePreset("https://web.afenda.example");

  assert.equal(preset.site.url, "https://web.afenda.example");
  assert.equal(preset.site.faviconPath, "/icon.svg");
  assert.equal(preset.site.defaultImage, "/opengraph-image");
  assert.equal(preset.metadata.site?.url, "https://web.afenda.example");
  assert.equal(preset.robots.sitemapPath, "/sitemap.xml");
  assert.ok(preset.sitemap);
});

test("createAppSitePreset resolves app-specific robots settings", () => {
  const preset = createAppSitePreset("https://app.afenda.example");
  const robotsRules = preset.robots.rules as { disallow?: string | string[] };

  assert.equal(preset.site.url, "https://app.afenda.example");
  assert.equal(preset.site.faviconPath, "/icon.svg");
  assert.equal(robotsRules.disallow, "/");
  assert.equal(preset.metadata.site?.url, "https://app.afenda.example");
  assert.equal(preset.metadata.site?.logoPath, "/icon.svg");
});
