import assert from "node:assert/strict";
import stylelint from "stylelint";
import afendaCssPlugins from "./afenda-css-plugin.mjs";

const globalsPath = "packages/ui/src/styles/globals.css";
const previewPath = "apps/storybook/.storybook/preview.css";

export async function lintWithRule(ruleName, code, codeFilename) {
  return stylelint.lint({
    code,
    codeFilename,
    config: {
      plugins: [...afendaCssPlugins],
      rules: { [ruleName]: true },
    },
    configFile: undefined,
  });
}

export async function expectRuleViolation(ruleName, code, codeFilename) {
  const result = await lintWithRule(ruleName, code, codeFilename);
  assert.equal(
    result.errored,
    true,
    `expected ${ruleName} to fail\n${JSON.stringify(result.results[0]?.warnings, null, 2)}`,
  );
  assert.ok(
    result.results[0].warnings.some((warning) => warning.rule === ruleName),
    `expected warning for ${ruleName}`,
  );
}

export async function expectRuleClean(ruleName, code, codeFilename) {
  const result = await lintWithRule(ruleName, code, codeFilename);
  const matching = result.results[0].warnings.filter(
    (warning) => warning.rule === ruleName,
  );
  assert.equal(
    matching.length,
    0,
    `expected ${ruleName} to pass\n${JSON.stringify(matching, null, 2)}`,
  );
}

export { globalsPath, previewPath };
