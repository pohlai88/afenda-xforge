import assert from "node:assert/strict";
import {
  compareRendererVersions,
  parseRendererVersion,
  satisfiesRendererVersionConstraint,
} from "../src/registry/renderer-version";
import { test } from "./test-runtime";

test("parseRendererVersion normalizes semver parts", () => {
  assert.deepEqual(parseRendererVersion("2.4.1"), [2, 4, 1]);
  assert.deepEqual(parseRendererVersion("2"), [2, 0, 0]);
  assert.deepEqual(parseRendererVersion("bad"), [0, 0, 0]);
});

test("compareRendererVersions orders versions", () => {
  assert.equal(compareRendererVersions("1.0.0", "1.0.0"), 0);
  assert.equal(compareRendererVersions("1.1.0", "1.0.9"), 1);
  assert.equal(compareRendererVersions("0.9.0", "1.0.0"), -1);
});

test("satisfiesRendererVersionConstraint honors exact and min constraints", () => {
  assert.equal(
    satisfiesRendererVersionConstraint("1.0.0", { exact: "1.0.0" }),
    true
  );
  assert.equal(
    satisfiesRendererVersionConstraint("1.0.1", { exact: "1.0.0" }),
    false
  );
  assert.equal(
    satisfiesRendererVersionConstraint("1.2.0", { min: "1.1.0" }),
    true
  );
  assert.equal(
    satisfiesRendererVersionConstraint("1.0.0", { min: "1.1.0" }),
    false
  );
  assert.equal(satisfiesRendererVersionConstraint("1.0.0", undefined), true);
});
