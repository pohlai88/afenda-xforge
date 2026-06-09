import assert from "node:assert/strict";
import test from "node:test";
import {
  createBreadcrumbJsonLd,
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  JsonLd,
  stringifyJsonLd,
} from "../src/json-ld.tsx";

test("stringifyJsonLd escapes HTML-sensitive characters", () => {
  const serialized = stringifyJsonLd({
    name: "<script>&</script>",
    separator: "\u2028",
  });

  assert.equal(
    serialized,
    '{"name":"\\u003cscript\\u003e\\u0026\\u003c/script\\u003e","separator":"\\u2028"}'
  );
});

test("JsonLd renders a safe JSON-LD script element", () => {
  const element = JsonLd({
    data: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Afenda",
      url: "https://afenda.example",
    },
    id: "website-json-ld",
  });

  const props = element.props as {
    id?: string;
    type?: string;
    dangerouslySetInnerHTML?: { __html?: string };
  };

  assert.equal(element.type, "script");
  assert.equal(props.id, "website-json-ld");
  assert.equal(props.type, "application/ld+json");
  assert.equal(
    props.dangerouslySetInnerHTML?.__html,
    '{"@context":"https://schema.org","@type":"WebSite","name":"Afenda","url":"https://afenda.example"}'
  );
});

test("createBreadcrumbJsonLd emits linked breadcrumb items", () => {
  const data = createBreadcrumbJsonLd([
    { name: "Home", url: "https://afenda.example" },
    { name: "Products", url: "https://afenda.example/products" },
  ]);

  assert.deepEqual(data.itemListElement, [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@id": "https://afenda.example",
        name: "Home",
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@id": "https://afenda.example/products",
        name: "Products",
      },
    },
  ]);
});

test("createOrganizationJsonLd supports richer organization metadata", () => {
  const data = createOrganizationJsonLd(
    "Afenda",
    "https://afenda.example",
    "https://afenda.example/logo.svg",
    {
      description: "ERP for modern operations",
      sameAs: ["https://x.com/afenda"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@afenda.example",
      },
    }
  );

  const organization = data as unknown as {
    logo?: string;
    description?: string;
    sameAs?: string[];
    contactPoint?: { "@type"?: string };
  };

  assert.equal(organization.logo, "https://afenda.example/logo.svg");
  assert.equal(organization.description, "ERP for modern operations");
  assert.deepEqual(organization.sameAs, ["https://x.com/afenda"]);
  assert.equal(organization.contactPoint?.["@type"], "ContactPoint");
});

test("createWebsiteJsonLd optionally includes a description", () => {
  const data = createWebsiteJsonLd(
    "Afenda",
    "https://afenda.example",
    "Work management platform"
  );

  assert.equal(data.description, "Work management platform");
});
