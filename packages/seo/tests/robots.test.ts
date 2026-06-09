import assert from "node:assert/strict";
import test from "node:test";
import { createRobots } from "../src/robots.ts";

test("createRobots resolves sitemap paths against the base url", () => {
  const robots = createRobots({
    baseUrl: "https://afenda.example",
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemapPath: "/sitemap.xml",
  });

  assert.deepEqual(robots, {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://afenda.example/sitemap.xml",
  });
});

test("createRobots supports multiple sitemap entries and a host", () => {
  const robots = createRobots({
    host: "afenda.example",
    baseUrl: "https://afenda.example",
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
      },
      {
        userAgent: ["Applebot", "Bingbot"],
        disallow: "/private/",
      },
    ],
    sitemapPath: ["/sitemap.xml", "/products/sitemap.xml"],
  });

  assert.deepEqual(robots, {
    host: "afenda.example",
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
      },
      {
        userAgent: ["Applebot", "Bingbot"],
        disallow: "/private/",
      },
    ],
    sitemap: [
      "https://afenda.example/sitemap.xml",
      "https://afenda.example/products/sitemap.xml",
    ],
  });
});
