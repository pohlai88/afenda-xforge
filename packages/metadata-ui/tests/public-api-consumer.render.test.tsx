import {
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
} from "@repo/metadata-ui/compatibility";
import {
  MetadataForm,
  MetadataSectionStack,
  MetadataStateBoundary,
} from "@repo/metadata-ui/components";
import type { MetadataConsumerScenarioDefinition } from "@repo/metadata-ui/contracts";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import {
  metadataConsumerScenarioMatrix,
  publicConsumerActions,
  publicConsumerFields,
  publicConsumerSections,
} from "@repo/metadata-ui/fixtures";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function renderConsumerScenario(
  scenario: MetadataConsumerScenarioDefinition
): void {
  const context = createMetadataRenderContext(
    {
      featureFlags: scenario.featureFlags,
      permissions: scenario.permissions,
      readonly: scenario.readonly,
      surfaceId: `public-api-consumer:${scenario.id}`,
    },
    {
      mode: scenario.mode,
      routeId: "metadata-ui/public-api-consumer",
      surfaceId: `public-api-consumer:${scenario.id}`,
    }
  );

  render(
    <div>
      <MetadataForm
        actions={publicConsumerActions}
        context={context}
        fields={publicConsumerFields}
        title="Profile"
        values={{ name: "Acme Billing" }}
      />
      <MetadataSectionStack
        context={context}
        sections={publicConsumerSections}
      />
      <MetadataStateBoundary context={context} state="ready">
        <div>Ready content</div>
      </MetadataStateBoundary>
    </div>
  );
}

describe("public api consumer fixture", () => {
  it("keeps the hardened quality assessment at enterprise-ready grade", () => {
    const assessment = createMetadataUiQualityAssessment({
      compatibility: createMetadataUiCompatibilityReport(),
      defaultRendererCoverage: true,
      governanceFallbackCoverage: true,
      gracefulUnknownFallbacks: true,
      telemetryCorrelationCoverage: true,
      verification: {
        boundaryLint: true,
        changeNote: true,
        consumerFixture: true,
        declarationSnapshot: true,
        generated: true,
        lint: true,
        publicApi: true,
        telemetrySchema: true,
        test: true,
        typecheck: true,
      },
    });

    expect(assessment.grade).toBe("A");
  });

  for (const scenario of metadataConsumerScenarioMatrix) {
    it(`renders scenario '${scenario.id}' through the public package surface`, () => {
      renderConsumerScenario(scenario);

      expect(screen.getAllByText("Profile").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("Records")).toBeInTheDocument();
      expect(screen.getByText("Ready content")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search invoices...")
      ).toBeInTheDocument();

      const forms = document.querySelectorAll("form");
      const saveButton = within(forms[0] as HTMLFormElement).getByRole(
        "button",
        {
          name: "Save",
        }
      );

      if (scenario.expectedDisabled) {
        expect(saveButton).toBeDisabled();
      } else {
        expect(saveButton).toBeEnabled();
      }
    });
  }
});
