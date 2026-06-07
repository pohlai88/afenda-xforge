import { withVercelToolbar } from "@vercel/toolbar/plugins/next";
import { keys } from "../keys.ts";

export const withToolbar = (config: object): object =>
  keys().FLAGS_SECRET ? withVercelToolbar()(config) : config;
