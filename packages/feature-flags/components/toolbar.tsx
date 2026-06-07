import { VercelToolbar } from "@vercel/toolbar/next";
import type { ReactElement } from "react";
import { keys } from "../keys.ts";

export const Toolbar = (): ReactElement | null =>
  keys().FLAGS_SECRET ? <VercelToolbar /> : null;
