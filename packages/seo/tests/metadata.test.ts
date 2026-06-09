import assert from "node:assert/strict";
import test from "node:test";
import { createMetadata } from "../src/metadata.ts";

test("createMetadata resolves defaults and uses the provided image", () => {
  const metadata = createMetadata({
    title: "Dashboard",
    description: "Internal dashboard",
    image: "/og/dashboard.png",
    site: {
      name: "Afenda",
      description: "Fallback description",
      url: "https://afenda.example",
      author: [{ name: "Team Afenda" }],
      faviconPath: "/favicon.ico",
      twitterHandle: "@afenda",
    },
  });

  assert.equal(metadata.title, "Dashboard | Afenda");
  assert.equal(metadata.description, "Internal dashboard");
  assert.equal(metadata.applicationName, "Afenda");
  assert.equal(metadata.metadataBase?.href, "https://afenda.example/");
  assert.equal(metadata.creator, "Team Afenda");
  assert.equal(metadata.openGraph?.url, "https://afenda.example");
  assert.deepEqual(metadata.openGraph?.images, [
    {
      url: "/og/dashboard.png",
      width: 1200,
      height: 630,
      alt: "Dashboard",
    },
  ]);
  assert.deepEqual(metadata.twitter?.images, ["/og/dashboard.png"]);
  assert.equal(metadata.icons?.icon, "/favicon.ico");
});

test("createMetadata falls back to the site default image", () => {
  const metadata = createMetadata({
    title: "Products",
    site: {
      name: "Afenda",
      description: "Fallback description",
      url: "https://afenda.example",
      defaultImage: "/og/default.png",
    },
  });

  assert.deepEqual(metadata.openGraph?.images, [
    {
      url: "/og/default.png",
      width: 1200,
      height: 630,
      alt: "Products",
    },
  ]);
});

test("createMetadata rejects invalid URLs", () => {
  assert.throws(
    () =>
      createMetadata({
        title: "Broken",
        site: {
          name: "Afenda",
          description: "Fallback description",
          url: "not-a-url",
        },
      }),
    /Invalid SEO site URL/
  );
});
