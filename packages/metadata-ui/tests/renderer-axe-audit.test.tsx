import type { RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import "vitest-axe/extend-expect";
import { axe } from "vitest-axe";

import type { MetadataUiManifestEntry } from "../metadata-ui.manifest";
import { metadataUiManifest } from "../metadata-ui.manifest";
import type { MetadataActionSurface } from "../src/contracts/action-renderer.contract";
import type { MetadataFieldKind } from "../src/contracts/field-renderer.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import type { MetadataSectionKind } from "../src/contracts/section-renderer.contract";
import {
  metadataUiGeneratedActionFixtures,
  metadataUiGeneratedFieldFixtures,
  metadataUiGeneratedSectionFixtures,
  publicConsumerValues,
} from "../src/generated/fixtures.generated";
import {
  defaultActionRegistry,
  defaultFieldRegistry,
  defaultSectionRegistry,
  defaultStateRegistry,
} from "../src/registry";
import {
  metadataRendererAxeRules,
  metadataRendererAxeTags,
} from "./axe-audit-config";

const baseContext = createMetadataRenderContext(
  {
    locale: "en-US",
    permissions: { read: true },
    surfaceId: "renderer-axe-audit",
  },
  {
    mode: "read",
    routeId: "metadata-ui/axe-audit",
    state: "ready",
  }
);

async function expectAccessible(result: RenderResult): Promise<void> {
  const report = await axe(result.container, {
    rules: metadataRendererAxeRules,
    runOnly: {
      type: "tag",
      values: [...metadataRendererAxeTags],
    },
  });

  expect(report).toHaveNoViolations();
}

function renderField(key: string): RenderResult {
  const fixture =
    metadataUiGeneratedFieldFixtures.find((field) => field.key === key) ??
    metadataUiGeneratedFieldFixtures.find((field) => field.kind === key);

  if (!fixture) {
    throw new Error(`Missing field fixture for ${key}`);
  }

  const fieldKind = (fixture.kind ?? key) as MetadataFieldKind;
  const Renderer = defaultFieldRegistry.get(fieldKind).renderer;
  const value =
    publicConsumerValues[fixture.key as keyof typeof publicConsumerValues];

  return render(
    (
      <Renderer context={baseContext} field={fixture} value={value} />
    ) as ReactElement
  );
}

function renderAction(key: string): RenderResult {
  const fixture =
    metadataUiGeneratedActionFixtures.find((action) => action.key === key) ??
    metadataUiGeneratedActionFixtures.find((action) => action.surface === key);

  if (!fixture) {
    throw new Error(`Missing action fixture for ${key}`);
  }

  const surface = (fixture.surface ?? key) as MetadataActionSurface;
  const Renderer = defaultActionRegistry.get(surface).renderer;

  return render(
    (
      <Renderer
        action={fixture}
        context={baseContext}
        onAction={(): void => undefined}
      />
    ) as ReactElement
  );
}

function renderSection(key: string): RenderResult {
  const fixture = metadataUiGeneratedSectionFixtures.find(
    (section) => section.key === key || section.kind === key
  );

  if (!fixture) {
    throw new Error(`Missing section fixture for ${key}`);
  }

  const kind = (fixture.kind ?? key) as MetadataSectionKind;
  const Renderer = defaultSectionRegistry.get(kind).renderer;

  return render(
    (<Renderer context={baseContext} section={fixture} />) as ReactElement
  );
}

function renderState(key: string): RenderResult {
  const Renderer = defaultStateRegistry.get(
    key as Parameters<typeof defaultStateRegistry.get>[0]
  ).renderer;

  return render(
    (
      <Renderer
        context={baseContext}
        emptyDescription="No records yet."
        emptyTitle="Nothing here"
        error="Something went wrong."
        forbiddenDescription="You do not have access."
        forbiddenTitle="Forbidden"
        loadingDescription="Loading records…"
        loadingTitle="Loading"
      >
        <p>Sample ready content.</p>
      </Renderer>
    ) as ReactElement
  );
}

const smokeEntries = metadataUiManifest.renderers.filter(
  (entry) => entry.smokeTest
);

describe("renderer axe audit (MUI-VIS-016)", () => {
  for (const entry of smokeEntries) {
    it(`passes axe for ${entry.kind}/${entry.registryKey}`, async () => {
      let result: RenderResult;

      switch (entry.kind) {
        case "field":
          result = renderField(entry.registryKey);
          break;
        case "action":
          result = renderAction(entry.registryKey);
          break;
        case "section":
          result = renderSection(entry.registryKey);
          break;
        case "state":
          result = renderState(entry.registryKey);
          break;
        default:
          throw new Error(
            `Unsupported renderer kind: ${(entry as MetadataUiManifestEntry).kind}`
          );
      }

      await expectAccessible(result);
    });
  }

  it("covers every manifest smokeTest renderer", () => {
    expect(smokeEntries.length).toBeGreaterThan(0);
    expect(smokeEntries.length).toBe(metadataUiManifest.renderers.length);
  });
});
