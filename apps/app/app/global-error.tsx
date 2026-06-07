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
            XForge
          </p>
          <h1 className="font-semibold text-2xl tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            The app shell hit an unexpected error. Try again, or reload the page
            if the issue persists.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <a
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-accent hover:text-accent-foreground"
            href="/"
          >
            Go home
          </a>
        </div>
      </main>
    </body>
  </html>
);

export default GlobalError;
