import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import type { ReactElement, ReactNode } from "react";

type UnauthenticatedLayoutProps = {
  children: ReactNode;
};

export default function UnauthenticatedLayout({
  children,
}: UnauthenticatedLayoutProps): ReactElement {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-border border-r bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.2),_transparent_42%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)] p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />
        <div className="relative z-10 flex w-full flex-col justify-between">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80 text-xs uppercase tracking-[0.32em]">
              XForge
            </div>
            <h1 className="max-w-xl font-semibold text-5xl tracking-tight">
              Managed auth without surrendering tenant or company control.
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              Supabase handles identity and session storage. XForge still
              enforces authorization, audit, and tenant boundaries on the
              server.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/75">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Session refresh through `@supabase/ssr`.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Server-side checks stay in `packages/auth` and app layouts.
            </div>
          </div>
        </div>
      </aside>
      <section className="relative flex items-center justify-center px-6 py-10 lg:px-10">
        <div className="absolute top-6 right-6">
          <ModeToggle />
        </div>
        <div className="w-full max-w-md space-y-8">{children}</div>
      </section>
    </main>
  );
}
