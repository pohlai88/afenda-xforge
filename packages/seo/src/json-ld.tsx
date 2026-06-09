import type { ReactElement } from "react";
import { createElement } from "react";
import type {
  BreadcrumbList,
  ContactPoint,
  Organization,
  Thing,
  WebSite,
  WithContext,
} from "schema-dts";

type JsonLdProps<T extends Thing> = {
  data: WithContext<T>;
  id?: string;
};

const JSON_SAFE_PATTERN = /[<>&\u2028\u2029]/g;

const JSON_SAFE_REPLACEMENTS: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export const stringifyJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(
    JSON_SAFE_PATTERN,
    (character) => JSON_SAFE_REPLACEMENTS[character] ?? character
  );

export function JsonLd<T extends Thing>({
  data,
  id,
}: JsonLdProps<T>): ReactElement {
  return createElement("script", {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires inline script content.
    dangerouslySetInnerHTML: { __html: stringifyJsonLd(data) },
    id,
    type: "application/ld+json",
  });
}

type OrganizationJsonLdOptions = {
  logo?: string;
  sameAs?: string[];
  contactPoint?: ContactPoint | ContactPoint[];
  description?: string;
};

export const createOrganizationJsonLd = (
  name: string,
  url: string,
  logo?: string,
  options: OrganizationJsonLdOptions = {}
): WithContext<Organization> => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name,
  url,
  ...(logo ? { logo } : {}),
  ...(options.description ? { description: options.description } : {}),
  ...(options.sameAs ? { sameAs: options.sameAs } : {}),
  ...(options.contactPoint ? { contactPoint: options.contactPoint } : {}),
});

export const createWebsiteJsonLd = (
  name: string,
  url: string,
  description?: string
): WithContext<WebSite> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name,
  url,
  ...(description ? { description } : {}),
});

export const createBreadcrumbJsonLd = (
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@id": item.url,
      name: item.name,
    },
  })),
});
