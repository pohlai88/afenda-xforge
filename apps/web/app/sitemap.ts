import type { MetadataRoute } from "next";
import { webSitemap } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return webSitemap;
}
