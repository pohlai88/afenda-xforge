import type { Meta, StoryObj } from "@storybook/react";

function Introduction() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 p-6 md:p-10">
      <header className="space-y-4">
        <div className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Afenda UI Storybook
        </div>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
          Component system workspace for primitives and curated shared surfaces.
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          This app is the visual audit layer for <code>@repo/ui</code>. It now
          separates stable system coverage from experimental component families
          and keeps the shared catalog easy to review.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-5 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Introduction
          </div>
          <h2 className="mt-2 text-xl font-semibold">System orientation</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use this section to understand package scope, naming rules, and how
            Storybook is organized before reviewing individual components.
          </p>
        </article>

      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">What is automated</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>The story catalog stays focused on the shared package surface and app-facing controls.</li>
            <li>Global toolbar controls switch light or dark mode.</li>
            <li>The preview CSS bootstraps Tailwind locally so Storybook remains isolated from app runtime assumptions.</li>
          </ul>
        </article>

        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recommended next steps</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Promote shared UI metadata cards into fully rendered demo stories category by category.</li>
            <li>Add visual regression or interaction tests once the stable story set is agreed.</li>
            <li>Split oversized catalogs into finer stories if bundle size becomes a practical problem.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

const meta = {
  title: "Introduction/Overview",
  component: Introduction,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Introduction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
