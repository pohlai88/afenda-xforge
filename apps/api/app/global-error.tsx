"use client";

import { fonts } from "@repo/design-system";
import type NextError from "next/error";
import type { ReactElement } from "react";

interface GlobalErrorProperties {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
}

const GlobalError = ({ reset }: GlobalErrorProperties): ReactElement => (
  <html className={fonts} lang="en">
    <body className="grid min-h-screen place-items-center bg-background px-6 py-10">
      <main className="w-full max-w-md space-y-6 rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
            XForge API
          </p>
          <h1 className="font-semibold text-2xl tracking-tight">
            API shell error
          </h1>
          <p className="text-muted-foreground">
            The separate API runtime hit an unexpected error.
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </main>
    </body>
  </html>
);

export default GlobalError;
