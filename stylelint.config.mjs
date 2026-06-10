/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "theme",
          "utility",
          "source",
          "import",
          "plugin",
          "apply",
          "layer",
          "config",
          "custom-variant",
        ],
      },
    ],
    "alpha-value-notation": null,
    "color-function-notation": null,
    "color-hex-length": null,
    "color-named": null,
    "function-disallowed-list": ["rgb", "hsl", "hsla"],
    "hue-degree-notation": null,
    "import-notation": null,
    "lightness-notation": null,
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "value-keyword-case": null,
  },
};
