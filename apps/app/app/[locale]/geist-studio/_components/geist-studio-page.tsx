"use client";

import {
  getVercelGeistColor,
  resolveGeistSemanticCssVars,
  VERCEL_GEIST_COLORS,
  VERCEL_GEIST_FOCUS,
  VERCEL_GEIST_GLOBALS_CSS_CONFLICTS,
  VERCEL_GEIST_IMPLEMENTATION_RULES,
  VERCEL_GEIST_LAYOUT,
  VERCEL_GEIST_MATERIALS,
  VERCEL_GEIST_NEUTRAL_SCALE,
  VERCEL_GEIST_PRINCIPLES,
  VERCEL_GEIST_SHADOWS,
  VERCEL_GEIST_SOURCES,
  VERCEL_GEIST_SPACING_TOKENS,
  VERCEL_GEIST_TYPOGRAPHY_STYLES,
} from "@repo/design-system/contracts/afenda/references";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { CSSProperties, ReactElement } from "react";

import { GeistStudioShell } from "./geist-studio-shell.tsx";
import { geistTypeStyle } from "./geist-type-style.ts";

function SectionHeading({
  description,
  id,
  title,
}: {
  description: string;
  id: string;
  title: string;
}): ReactElement {
  return (
    <header className="space-y-2" id={id}>
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
        {id}
      </p>
      <h2 className="font-semibold" style={geistTypeStyle("display-section")}>
        {title}
      </h2>
      <p className="max-w-2xl text-muted-foreground text-sm leading-6">
        {description}
      </p>
    </header>
  );
}

function ShadowCard({
  children,
  className,
  shadow,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  shadow: string;
  style?: CSSProperties;
}): ReactElement {
  return (
    <div
      className={cn("bg-card p-6 text-card-foreground", className)}
      style={{ boxShadow: shadow, ...style }}
    >
      {children}
    </div>
  );
}

function resolveMaterialShadow(materialKey: string): string {
  switch (materialKey) {
    case "menu":
      return VERCEL_GEIST_SHADOWS.menu;
    case "modal":
      return VERCEL_GEIST_SHADOWS.modal;
    case "tooltip":
      return VERCEL_GEIST_SHADOWS.borderSmall;
    default:
      return VERCEL_GEIST_SHADOWS.borderMedium;
  }
}

function ColorSwatch({
  hex,
  oklch,
  role,
  usage,
}: {
  hex: string;
  oklch: string;
  role: string;
  usage: string;
}): ReactElement {
  return (
    <div
      className="overflow-hidden rounded-md bg-card text-card-foreground"
      style={{ boxShadow: VERCEL_GEIST_SHADOWS.border }}
    >
      <div className="h-16 w-full" style={{ backgroundColor: hex }} />
      <div className="space-y-1 p-3">
        <p className="font-medium font-mono text-sm">{role}</p>
        <p className="font-mono text-muted-foreground text-xs">{hex}</p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {oklch}
        </p>
        <p className="text-muted-foreground text-xs leading-5">{usage}</p>
      </div>
    </div>
  );
}

export function GeistStudioPage(): ReactElement {
  const statusDotColors = VERCEL_GEIST_COLORS.filter(
    (token) => token.category === "status-dot"
  );
  const geistAccent = resolveGeistSemanticCssVars("light")["--accent"];

  return (
    <GeistStudioShell>
      <section className="space-y-6" id="overview">
        <SectionHeading
          description="Live reference for the Vercel Geist contract. This scope applies resolveGeistSemanticCssVars — not just the vercel-geist theme preset — so surfaces read achromatic instead of XForge teal tints."
          id="overview"
          title="Geist implementation contract"
        />
        <ShadowCard
          className="space-y-4 p-8"
          shadow={VERCEL_GEIST_SHADOWS.borderMedium}
          style={{ borderRadius: "12px" }}
        >
          <p
            className="max-w-3xl font-semibold"
            style={geistTypeStyle("display-hero")}
          >
            Ink is the brand.
          </p>
          <p className="max-w-2xl text-base text-muted-foreground leading-7">
            Picking the <strong>vercel</strong> theme preset in appearance
            settings updates tenant brand hues only. Geist Studio additionally
            overrides semantic tokens (
            <code className="font-mono text-xs">--background</code>,{" "}
            <code className="font-mono text-xs">--accent</code>,{" "}
            <code className="font-mono text-xs">--radius</code>) that otherwise
            stay on Afenda defaults — see{" "}
            <a
              className="text-[color:var(--geist-link)] hover:underline"
              href="#conflicts"
            >
              Afenda conflicts
            </a>
            .
          </p>
        </ShadowCard>
        <ul className="grid gap-3 md:grid-cols-2">
          {VERCEL_GEIST_PRINCIPLES.map((principle) => (
            <li
              className="rounded-md bg-card px-4 py-3 text-card-foreground text-sm leading-6"
              key={principle}
              style={{ boxShadow: VERCEL_GEIST_SHADOWS.border }}
            >
              {principle}
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Contract sources</h3>
          <ul className="space-y-1 font-mono text-[color:var(--geist-link)] text-xs">
            {Object.entries(VERCEL_GEIST_SOURCES).map(([key, url]) => (
              <li key={key}>
                <a href={url} rel="noreferrer" target="_blank">
                  {key}: {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          description="18 audited tokens with hex, OKLCH, category, and usage constraints from vercel-geist.contract.ts."
          id="colors"
          title="Color tokens"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {VERCEL_GEIST_COLORS.map((token) => (
            <ColorSwatch
              hex={token.hex}
              key={token.role}
              oklch={token.oklch}
              role={token.role}
              usage={token.usage}
            />
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Neutral scale</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(VERCEL_GEIST_NEUTRAL_SCALE).map(([step, hex]) => (
              <div className="text-center" key={step}>
                <div
                  className="size-12 rounded-md"
                  style={{
                    backgroundColor: hex,
                    boxShadow: VERCEL_GEIST_SHADOWS.border,
                  }}
                />
                <p className="mt-1 font-mono text-[10px]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          description="Geist Sans and Geist Mono styles — weights capped at 600, negative tracking on display sizes."
          id="typography"
          title="Typography"
        />
        <div className="space-y-4">
          {Object.entries(VERCEL_GEIST_TYPOGRAPHY_STYLES).map(
            ([name, style]) => (
              <ShadowCard key={name} shadow={VERCEL_GEIST_SHADOWS.border}>
                <p className="mb-3 font-mono text-muted-foreground text-xs">
                  {name}
                </p>
                <p
                  className={cn(
                    style.fontPreset === "geist-mono" && "font-mono"
                  )}
                  style={{
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    letterSpacing: style.letterSpacing,
                    lineHeight: style.lineHeight,
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                  {style.usage}
                </p>
              </ShadowCard>
            )
          )}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          description="Material tiers from Geist docs — radius and stacked shadow borders."
          id="materials"
          title="Materials & elevation"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(VERCEL_GEIST_MATERIALS).map(([key, material]) => (
            <ShadowCard
              className="space-y-2"
              key={key}
              shadow={resolveMaterialShadow(key)}
              style={{ borderRadius: material.radius }}
            >
              <p className="font-medium font-mono text-sm">
                {material.className}
              </p>
              <p className="text-muted-foreground text-sm">{material.usage}</p>
              <p className="font-mono text-muted-foreground text-xs">
                radius: {material.radius}
              </p>
            </ShadowCard>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(VERCEL_GEIST_SPACING_TOKENS)
            .slice(0, 8)
            .map(([token, value]) => (
              <div
                className="rounded-md bg-card px-3 py-2 font-mono text-card-foreground text-xs"
                key={token}
                style={{ boxShadow: VERCEL_GEIST_SHADOWS.border }}
              >
                <span className="text-muted-foreground">{token}</span>
                <span className="ml-2">{value}</span>
              </div>
            ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          description="Patterns wired through semantic CSS variables on this page — ghost hover uses --accent (hairline), links use --geist-link."
          id="components"
          title="Component patterns"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <ShadowCard
            className="space-y-4"
            shadow={VERCEL_GEIST_SHADOWS.borderMedium}
            style={{ borderRadius: "12px" }}
          >
            <h3 className="font-medium text-sm">Actions</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="rounded-md">Primary CTA</Button>
              <Button className="rounded-md" variant="ghost">
                Ghost nav
              </Button>
              <a
                className="text-[color:var(--geist-link)] text-sm hover:underline"
                href="#components"
              >
                Link blue
              </a>
            </div>
            <p className="font-mono text-muted-foreground text-xs">
              --accent (ghost hover): {geistAccent}
            </p>
          </ShadowCard>

          <ShadowCard
            className="space-y-4"
            shadow={VERCEL_GEIST_SHADOWS.borderMedium}
            style={{ borderRadius: "12px" }}
          >
            <h3 className="font-medium text-sm">Form control</h3>
            <label className="block space-y-2 text-sm">
              <span className="text-muted-foreground">Project name</span>
              <input
                className="h-10 w-full rounded-md bg-transparent px-3 text-sm outline-none focus:outline focus:outline-1 focus:outline-[color:var(--geist-focus)]"
                placeholder="my-project"
                style={{ boxShadow: VERCEL_GEIST_SHADOWS.border }}
                type="text"
              />
            </label>
            <p className="font-mono text-muted-foreground text-xs">
              Focus: {VERCEL_GEIST_FOCUS.inputOutline}
            </p>
          </ShadowCard>

          <ShadowCard
            className="space-y-4 lg:col-span-2"
            shadow={VERCEL_GEIST_SHADOWS.borderMedium}
            style={{ borderRadius: "12px" }}
          >
            <h3 className="font-medium text-sm">Status dots (≤10px)</h3>
            <div className="flex flex-wrap gap-6">
              {statusDotColors.map((token) => (
                <div
                  className="flex items-center gap-2 text-sm"
                  key={token.role}
                >
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: token.hex }}
                  />
                  <span className="font-mono text-xs">{token.role}</span>
                </div>
              ))}
            </div>
          </ShadowCard>

          <ShadowCard
            className="space-y-3 lg:col-span-2"
            shadow={VERCEL_GEIST_SHADOWS.borderMedium}
            style={{ borderRadius: "12px" }}
          >
            <h3 className="font-medium text-sm">Focus double-ring</h3>
            <button
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
              style={{ boxShadow: VERCEL_GEIST_FOCUS.ring }}
              type="button"
            >
              Tab to preview focus ring
            </button>
            <p className="font-mono text-muted-foreground text-xs">
              {VERCEL_GEIST_FOCUS.ring}
            </p>
          </ShadowCard>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          description="Rules from VERCEL_GEIST_IMPLEMENTATION_RULES — the checklist for @repo/ui and apps/app."
          id="guidelines"
          title="Implementation guidelines"
        />
        {Object.entries(VERCEL_GEIST_IMPLEMENTATION_RULES).map(
          ([category, rules]) => (
            <div className="space-y-3" key={category}>
              <h3 className="font-medium text-sm capitalize">{category}</h3>
              <ul className="space-y-2">
                {rules.map((rule) => (
                  <li
                    className="rounded-md bg-card px-4 py-3 text-card-foreground text-sm leading-6"
                    key={rule}
                    style={{ boxShadow: VERCEL_GEIST_SHADOWS.border }}
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        <p className="text-muted-foreground text-xs">
          Layout contract: max-width {VERCEL_GEIST_LAYOUT.pageWidth}, margin{" "}
          {VERCEL_GEIST_LAYOUT.pageMargin}, header{" "}
          {VERCEL_GEIST_LAYOUT.headerHeight}. Ink:{" "}
          {getVercelGeistColor("ink").hex}, link:{" "}
          {getVercelGeistColor("link").hex}.
        </p>
      </section>

      <section className="space-y-6 pb-12" id="conflicts">
        <SectionHeading
          description="Why vercel-geist theme preset alone looked like Afenda — and what Geist Studio overrides."
          id="conflicts-heading"
          title="Afenda globals.css conflicts"
        />
        <div className="overflow-x-auto rounded-md bg-card">
          <table
            className="w-full min-w-[640px] text-left text-sm"
            style={{ boxShadow: VERCEL_GEIST_SHADOWS.border }}
          >
            <thead>
              <tr className="border-border border-b text-muted-foreground">
                <th className="px-4 py-3 font-medium">Token</th>
                <th className="px-4 py-3 font-medium">Afenda default</th>
                <th className="px-4 py-3 font-medium">Geist target</th>
                <th className="px-4 py-3 font-medium">Studio fix</th>
              </tr>
            </thead>
            <tbody>
              {VERCEL_GEIST_GLOBALS_CSS_CONFLICTS.map((row) => (
                <tr
                  className="border-border border-b align-top"
                  key={row.token}
                >
                  <td className="px-4 py-3 font-mono text-xs">{row.token}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {row.afendaDefault}
                  </td>
                  <td className="px-4 py-3 text-xs">{row.geistTarget}</td>
                  <td className="px-4 py-3 text-xs">{row.studioFix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-2 text-muted-foreground text-sm leading-6">
          {VERCEL_GEIST_GLOBALS_CSS_CONFLICTS.map((row) => (
            <li key={`${row.token}-issue`}>
              <span className="font-mono text-foreground text-xs">
                {row.token}
              </span>
              {" — "}
              {row.issue}
            </li>
          ))}
        </ul>
      </section>
    </GeistStudioShell>
  );
}
