import type { Metadata } from "next";
import type { ReactElement } from "react";

import { GeistStudioPage } from "./_components/geist-studio-page.tsx";

export const metadata: Metadata = {
  title: "Geist Studio",
  description:
    "Live reference for the Vercel Geist design contract in @repo/design-system.",
};

export default function GeistStudioRoutePage(): ReactElement {
  return <GeistStudioPage />;
}
