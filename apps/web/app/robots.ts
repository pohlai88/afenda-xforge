import type { MetadataRoute } from "next";
import { webRobots } from "./seo";

export default function robots(): MetadataRoute.Robots {
  return webRobots;
}
