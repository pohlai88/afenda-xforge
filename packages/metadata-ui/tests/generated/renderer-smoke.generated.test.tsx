import assert from "node:assert/strict";
import { test } from "../test-runtime";

import {
  metadataConsumerScenarioMatrix,
  metadataUiGeneratedActionFixtures,
  metadataUiGeneratedFieldFixtures,
  metadataUiGeneratedSectionFixtures,
  metadataUiFixtureCoverage,
  metadataUiSmokeCoverage,
  publicConsumerActions,
  publicConsumerFields,
  publicConsumerSections,
  runPublicApiConsumerSmoke,
} from "../../fixtures/public-api-consumer";
import {
  generatedActionRendererRegistrations
} from "../../src/generated/action-renderer-registry.generated";
import {
  generatedFieldRendererRegistrations
} from "../../src/generated/field-renderer-registry.generated";
import {
  generatedSectionRendererRegistrations,
} from "../../src/generated/section-renderer-registry.generated";
import {
  defaultActionRegistry,
  defaultFieldRegistry,
  defaultSectionRegistry,
} from "../../src/registry";

test("generated renderer registrations stay aligned with default registries", () => {
  for (const registration of generatedFieldRendererRegistrations) {
    assert.equal(
      defaultFieldRegistry.get(registration.key).renderer,
      registration.renderer
    );
  }

  for (const registration of generatedActionRendererRegistrations) {
    assert.equal(
      defaultActionRegistry.get(registration.key).renderer,
      registration.renderer
    );
  }

  for (const registration of generatedSectionRendererRegistrations) {
    assert.equal(
      defaultSectionRegistry.get(registration.key).renderer,
      registration.renderer
    );
  }
});

test("generated fixtures and smoke coverage stay in lockstep with manifest-backed registries", () => {
  assert.deepEqual(
    [...metadataUiFixtureCoverage.field].sort(),
    generatedFieldRendererRegistrations.map((registration) => registration.key).sort()
  );
  assert.deepEqual(
    [...metadataUiFixtureCoverage.action].sort(),
    generatedActionRendererRegistrations
      .map((registration) => registration.key)
      .sort()
  );
  assert.deepEqual(
    [...metadataUiFixtureCoverage.section].sort(),
    generatedSectionRendererRegistrations
      .map((registration) => registration.key)
      .sort()
  );

  assert.deepEqual(metadataUiFixtureCoverage, metadataUiSmokeCoverage);
  assert.equal(
    metadataUiGeneratedFieldFixtures.length,
    metadataUiFixtureCoverage.field.length
  );
  assert.equal(
    metadataUiGeneratedActionFixtures.length,
    metadataUiFixtureCoverage.action.length
  );
  assert.equal(
    metadataUiGeneratedSectionFixtures.length,
    metadataUiFixtureCoverage.section.length
  );
  assert.equal(publicConsumerSections.length, 2);
  assert.equal(publicConsumerActions.length, metadataUiGeneratedActionFixtures.length);
  assert.equal(publicConsumerFields.length, metadataUiGeneratedFieldFixtures.length);
});

test("generated public consumer smoke covers every scenario and searchable surface", () => {
  const result = runPublicApiConsumerSmoke();

  assert.equal(result.compatibilityOk, true);
  assert.equal(result.qualityGrade, "A");
  assert.equal(result.containsSearchPlaceholder, true);
  assert.equal(result.scenarios.length, metadataConsumerScenarioMatrix.length);

  for (const scenario of result.scenarios) {
    assert.equal(scenario.containsActionLabel, true);
    assert.equal(scenario.containsSearchPlaceholder, true);
    assert.equal(scenario.formText.includes("Profile"), true);
    assert.equal(scenario.sectionText.includes("Records"), true);
    assert.equal(scenario.stateText.includes("Ready content"), true);
  }
});
