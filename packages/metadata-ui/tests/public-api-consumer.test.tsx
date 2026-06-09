import assert from "node:assert/strict";
import { test } from "node:test";

import {
  metadataConsumerScenarioMatrix,
  runPublicApiConsumerSmoke,
} from "../fixtures/public-api-consumer";

test("public api consumer fixture covers every supported consumer mode and governance variant", () => {
  const result = runPublicApiConsumerSmoke();

  assert.equal(result.compatibilityOk, true);
  assert.equal(result.qualityGrade, "A");
  assert.equal(result.scenarios.length, metadataConsumerScenarioMatrix.length);

  for (const scenario of metadataConsumerScenarioMatrix) {
    const observedScenario = result.scenarios.find(
      (candidate) => candidate.id === scenario.id
    );

    assert.ok(observedScenario, `missing scenario '${scenario.id}'`);
    assert.equal(observedScenario.mode, scenario.mode);
    assert.equal(observedScenario.readonly, scenario.readonly ?? false);
    assert.equal(
      observedScenario.containsDisabledControl,
      scenario.expectedDisabled
    );
    assert.match(observedScenario.formText, /Profile/);
    assert.equal(observedScenario.containsActionLabel, true);
    assert.match(observedScenario.sectionText, /Records/);
    assert.match(observedScenario.stateText, /Ready content/);
  }
});
