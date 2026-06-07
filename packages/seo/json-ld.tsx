import type { ReactElement } from "react";
import type { BreadcrumbList, Thing, WithContext } from "schema-dts";

type JsonLdProps<T extends Thing> = {
  data: WithContext<T>;
  id?: string;
};

export function JsonLd<T extends Thing>({
  data,
  id,
}: JsonLdProps<T>): ReactElement {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires inline script content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      id={id}
      type="application/ld+json"
    />
  );
}

export const createOrganizationJsonLd = (
  name: string,
  url: string,
  logo?: string
): WithContext<Thing> => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name,
  url,
  ...(logo ? { logo } : {}),
});

export const createWebsiteJsonLd = (
  name: string,
  url: string,
  description?: string
): WithContext<Thing> => ({
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
    name: item.name,
    item: item.url,
  })),
});
