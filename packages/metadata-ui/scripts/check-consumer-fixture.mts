import {
  metadataConsumerScenarioMatrix,
  runPublicApiConsumerSmoke,
} from "../fixtures/public-api-consumer.tsx";

const result = runPublicApiConsumerSmoke();
const violations: string[] = [];

if (!result.compatibilityOk) {
  violations.push("public consumer fixture observed a compatibility failure");
}

if (result.qualityGrade !== "A") {
  violations.push(
    `public consumer fixture expected quality grade 'A' but received '${result.qualityGrade}'`
  );
}

if (result.formType !== "form") {
  violations.push(
    "MetadataForm did not resolve to a form root for the consumer fixture"
  );
}

if (result.sectionStackType !== "div") {
  violations.push(
    "MetadataSectionStack did not resolve to the expected consumer root element"
  );
}

if (result.stateBoundaryType === null) {
  violations.push(
    "MetadataStateBoundary did not return a renderable consumer element"
  );
}

const coveredModes = new Set(result.scenarios.map((scenario) => scenario.mode));

for (const mode of ["create", "read", "update", "review"] as const) {
  if (!coveredModes.has(mode)) {
    violations.push(
      `public consumer fixture is missing mode coverage for '${mode}'`
    );
  }
}

for (const scenario of metadataConsumerScenarioMatrix) {
  const observedScenario = result.scenarios.find(
    (candidate) => candidate.id === scenario.id
  );

  if (!observedScenario) {
    violations.push(
      `public consumer fixture is missing scenario '${scenario.id}'`
    );
    continue;
  }

  if (!observedScenario.formText.includes("Profile")) {
    violations.push(`scenario '${scenario.id}' did not render the form header`);
  }

  if (!observedScenario.containsActionLabel) {
    violations.push(
      `scenario '${scenario.id}' did not render the action label`
    );
  }

  if (!observedScenario.sectionText.includes("Records")) {
    violations.push(
      `scenario '${scenario.id}' did not render the metadata section stack`
    );
  }

  if (!observedScenario.stateText.includes("Ready content")) {
    violations.push(
      `scenario '${scenario.id}' did not preserve ready state boundary children`
    );
  }

  if (observedScenario.containsDisabledControl !== scenario.expectedDisabled) {
    violations.push(
      `scenario '${scenario.id}' expected disabled controls '${scenario.expectedDisabled}' but received '${observedScenario.containsDisabledControl}'`
    );
  }
}

if (violations.length > 0) {
  console.error("metadata-ui public consumer fixture failed:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("metadata-ui public consumer fixture passed");
