import { createAppSitePreset } from "@repo/seo/presets";
import type { MetadataRoute } from "next";

const appSitePreset = createAppSitePreset(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
);

export default function robots(): MetadataRoute.Robots {
  return appSitePreset.robots;
}
