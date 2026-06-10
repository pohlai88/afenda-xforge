import type { Meta, StoryObj } from "@storybook/react";

function Introduction() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 p-6 md:p-10">
      <header className="space-y-4">
        <div className="font-medium text-muted-foreground text-sm uppercase tracking-[0.24em]">
          Afenda UI Storybook
        </div>
        <h1 className="max-w-4xl font-semibold text-4xl tracking-tight md:text-5xl">
          Visual audit layer for <code>@repo/ui</code> and{" "}
          <code>@repo/metadata-ui</code>.
        </h1>
        <p className="max-w-3xl text-muted-foreground text-sm leading-7 md:text-base">
          Browse compose galleries, shadcn primitives, compose registry
          metadata, and metadata-ui renderer matrices from a single workspace.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-5 shadow-sm">
          <div className="font-medium text-muted-foreground text-sm">UI</div>
          <h2 className="mt-2 font-semibold text-xl">Compose + primitives</h2>
          <p className="mt-3 text-muted-foreground text-sm leading-6">
            40 compose galleries split by Form, Data, Navigation, and Feedback,
            plus registry reference and shadcn primitive stories.
          </p>
        </article>
        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-5 shadow-sm">
          <div className="font-medium text-muted-foreground text-sm">
            Metadata UI
          </div>
          <h2 className="mt-2 font-semibold text-xl">Renderer matrices</h2>
          <p className="mt-3 text-muted-foreground text-sm leading-6">
            Fields, actions, states, sections, visual states, and the
            integration smoke fixture.
          </p>
        </article>
        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-5 shadow-sm">
          <div className="font-medium text-muted-foreground text-sm">
            Automation
          </div>
          <h2 className="mt-2 font-semibold text-xl">CI gates</h2>
          <p className="mt-3 text-muted-foreground text-sm leading-6">
            Static build, Playwright smoke, and test-runner axe checks run in
            CI.
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-xl">What is automated</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground text-sm leading-6">
            <li>
              <code>check:build</code> validates static Storybook production
              builds.
            </li>
            <li>
              <code>check:metadata-ui-browser-smoke</code> exercises pagination,
              search, sort, and console-error checks in Playwright.
            </li>
            <li>
              <code>test:stories</code> boots Storybook in CI mode and runs
              test-runner with axe checks on stories marked{" "}
              <code>a11y.test: {'error'}</code> (Introduction, Metadata
              UI, primitives, compose registry). Compose galleries stay on{" "}
              <code>todo</code> until underlying pattern fixes land.
            </li>
            <li>
              <code>pretest:stories</code> verifies metadata-ui generated
              fixtures are current.
            </li>
            <li>Global toolbar controls switch light or dark mode.</li>
          </ul>
        </article>

        <article className="rounded-[calc(var(--radius)+0.5rem)] border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-xl">Commands</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground text-sm leading-6">
            <li>
              <code>pnpm --filter storybook dev</code>
            </li>
            <li>
              <code>pnpm --filter storybook test:stories</code>
            </li>
            <li>
              <code>pnpm --filter storybook preview:static</code>
            </li>
            <li>
              <code>pnpm --filter storybook generate:compose-stories</code>
            </li>
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
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Introduction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
