/**
 * Afenda CSS architecture rules for Tailwind v4 + shadcn token pipeline.
 * Aligns with tailwind-v4-shadcn four-step architecture and OKLCH design tokens.
 */
import stylelint from "stylelint";

const pluginNamespace = "afenda";

const REQUIRED_THEME_INLINE_MAPPINGS = [
  "--color-background: var(--background)",
  "--color-foreground: var(--foreground)",
  "--color-primary: var(--primary)",
  "--color-card: var(--card)",
  "--color-border: var(--border)",
  "--shadow-sm: var(--elevation-sm)",
  "--radius-panel: var(--radius-panel)",
  "--color-info-muted-foreground: var(--info-muted-foreground)",
  "--color-success-muted-foreground: var(--success-muted-foreground)",
  "--color-warning-muted-foreground: var(--warning-muted-foreground)",
  "--color-destructive-muted-foreground: var(--destructive-muted-foreground)",
];

function isGlobalsStylesheet(source) {
  return source.replace(/\\/g, "/").endsWith("globals.css");
}

function isPreviewStylesheet(source) {
  return source.replace(/\\/g, "/").endsWith("preview.css");
}

function getStylesheetSource(root) {
  return (
    root.source?.input?.from ??
    root.source?.input?.file ??
    root.source?.input?.id ??
    ""
  );
}

function report(result, ruleName, node, message) {
  stylelint.utils.report({
    message,
    node,
    result,
    ruleName,
  });
}

const noRootInLayerBase = stylelint.createPlugin(
  `${pluginNamespace}/no-root-in-layer-base`,
  () => {
    return (root, result) => {
      root.walkAtRules("layer", (layerRule) => {
        if (layerRule.params.trim() !== "base") {
          return;
        }

        layerRule.walkRules((rule) => {
          if (rule.selector === ":root" || rule.selector === ".dark") {
            report(
              result,
              `${pluginNamespace}/no-root-in-layer-base`,
              rule,
              `:root and .dark must be defined at the stylesheet root, not inside @layer base (Tailwind v4 + shadcn rule)`,
            );
          }
        });
      });
    };
  },
);

const noDarkNestedTheme = stylelint.createPlugin(
  `${pluginNamespace}/no-dark-nested-theme`,
  () => {
    return (root, result) => {
      root.walkRules(".dark", (darkRule) => {
        darkRule.walkAtRules("theme", () => {
          report(
            result,
            `${pluginNamespace}/no-dark-nested-theme`,
            darkRule,
            `.dark must override CSS variables directly — do not nest @theme inside .dark (Tailwind v4 rule)`,
          );
        });
      });
    };
  },
);

const noHslVarWrap = stylelint.createPlugin(
  `${pluginNamespace}/no-hsl-var-wrap`,
  () => {
    return (root, result) => {
      root.walkDecls((decl) => {
        if (/hsl\(\s*var\(/i.test(decl.value)) {
          report(
            result,
            `${pluginNamespace}/no-hsl-var-wrap`,
            decl,
            `Do not wrap semantic tokens with hsl(var(--*)) — use var(--*) directly (Tailwind v4 + shadcn rule)`,
          );
        }
      });
    };
  },
);

const themeInlineUsesVar = stylelint.createPlugin(
  `${pluginNamespace}/theme-inline-uses-var`,
  () => {
    return (root, result) => {
      root.walkAtRules("theme", (themeRule) => {
        if (!/\binline\b/.test(themeRule.params)) {
          return;
        }

        themeRule.walkDecls((decl) => {
          if (!decl.prop.startsWith("--color-") && !decl.prop.startsWith("--shadow-")) {
            return;
          }

          if (!/^var\(--[a-z0-9-]+\)$/.test(decl.value.trim())) {
            report(
              result,
              `${pluginNamespace}/theme-inline-uses-var`,
              decl,
              `@theme inline mappings like ${decl.prop} must reference semantic CSS variables via var(--token), not raw color literals`,
            );
          }
        });
      });
    };
  },
);

const tokenSourcesUseOklchOrVar = stylelint.createPlugin(
  `${pluginNamespace}/token-sources-use-oklch-or-var`,
  () => {
    return (root, result) => {
      for (const selector of [":root", ".dark"]) {
        root.walkRules(selector, (rule) => {
          rule.walkDecls((decl) => {
            if (!decl.prop.startsWith("--")) {
              return;
            }

            const value = decl.value.trim();

            if (/^var\(/.test(value)) {
              return;
            }

            if (/^oklch\(/i.test(value)) {
              return;
            }

            if (/^(calc|color-mix)\(/i.test(value)) {
              return;
            }

            if (
              /#[0-9a-f]{3,8}\b/i.test(value) ||
              /\brgb\s*\(/i.test(value) ||
              /\bhsl\s*\(/i.test(value) ||
              /\bhsla\s*\(/i.test(value)
            ) {
              report(
                result,
                `${pluginNamespace}/token-sources-use-oklch-or-var`,
                decl,
                `Semantic token ${decl.prop} in ${selector} must use oklch(), var(), calc(), or color-mix() — not legacy hex/rgb/hsl literals`,
              );
            }
          });
        });
      }
    };
  },
);

const previewCssPipeline = stylelint.createPlugin(
  `${pluginNamespace}/preview-css-pipeline`,
  () => {
    return (root, result) => {
      const source = getStylesheetSource(root);

      if (!isPreviewStylesheet(source)) {
        return;
      }

      let importsTailwind = false;
      let importsGlobals = false;
      let hasStorySource = false;
      let hasIntroGridUtility = false;

      root.walkAtRules((atRule) => {
        if (atRule.name === "import") {
          const params = atRule.params.replace(/["']/g, "").trim();

          if (params === "tailwindcss") {
            importsTailwind = true;
          }

          if (params.includes("@repo/ui/styles/globals.css")) {
            importsGlobals = true;
          }
        }

        if (atRule.name === "source" && /stories/.test(atRule.params)) {
          hasStorySource = true;
        }

        if (atRule.name === "utility" && atRule.params.trim() === "sb-intro-grid-bg") {
          hasIntroGridUtility = true;
        }
      });

      if (importsTailwind) {
        report(
          result,
          `${pluginNamespace}/preview-css-pipeline`,
          root,
          `preview.css must not @import tailwindcss — inherit the Tailwind pipeline from globals.css only`,
        );
      }

      if (!importsGlobals) {
        report(
          result,
          `${pluginNamespace}/preview-css-pipeline`,
          root,
          `preview.css must @import @repo/ui/styles/globals.css as the single token source of truth`,
        );
      }

      if (!hasStorySource) {
        report(
          result,
          `${pluginNamespace}/preview-css-pipeline`,
          root,
          `preview.css must declare @source ../stories/**/*.{ts,tsx} for Storybook class scanning`,
        );
      }

      if (!hasIntroGridUtility) {
        report(
          result,
          `${pluginNamespace}/preview-css-pipeline`,
          root,
          `preview.css must register @utility sb-intro-grid-bg for intro grid backgrounds`,
        );
      }
    };
  },
);

const utilityUsesDeclarations = stylelint.createPlugin(
  `${pluginNamespace}/utility-uses-declarations`,
  () => {
    return (root, result) => {
      root.walkAtRules("utility", (utilityRule) => {
        if (utilityRule.nodes?.length) {
          return;
        }

        report(
          result,
          `${pluginNamespace}/utility-uses-declarations`,
          utilityRule,
          `@utility ${utilityRule.params.trim()} must contain standard CSS declarations — prefer @utility over ad-hoc arbitrary values in TSX`,
        );
      });
    };
  },
);

const requireCustomVariantDark = stylelint.createPlugin(
  `${pluginNamespace}/require-custom-variant-dark`,
  () => {
    return (root, result) => {
      const source = getStylesheetSource(root);

      if (!isGlobalsStylesheet(source)) {
        return;
      }

      let hasCustomVariant = false;

      root.walkAtRules("custom-variant", (atRule) => {
        if (
          /\bdark\b/.test(atRule.params) &&
          /&:where\(\.dark,\s*\.dark\s\*\)/.test(atRule.params)
        ) {
          hasCustomVariant = true;
        }
      });

      if (!hasCustomVariant) {
        report(
          result,
          `${pluginNamespace}/require-custom-variant-dark`,
          root,
          `globals.css must declare @custom-variant dark (&:where(.dark, .dark *)) for Tailwind v4 class-based dark mode`,
        );
      }
    };
  },
);

const requireTopLevelRootDark = stylelint.createPlugin(
  `${pluginNamespace}/require-top-level-root-dark`,
  () => {
    return (root, result) => {
      const source = getStylesheetSource(root);

      if (!isGlobalsStylesheet(source)) {
        return;
      }

      let hasRoot = false;
      let hasDark = false;

      for (const node of root.nodes ?? []) {
        if (node.type !== "rule") {
          continue;
        }

        if (node.selector === ":root") {
          hasRoot = true;
        }

        if (node.selector === ".dark") {
          hasDark = true;
        }
      }

      if (!hasRoot) {
        report(
          result,
          `${pluginNamespace}/require-top-level-root-dark`,
          root,
          `globals.css must define :root at the stylesheet root (not inside @layer base)`,
        );
      }

      if (!hasDark) {
        report(
          result,
          `${pluginNamespace}/require-top-level-root-dark`,
          root,
          `globals.css must define .dark at the stylesheet root for theme switching`,
        );
      }
    };
  },
);

const requireThemeInline = stylelint.createPlugin(
  `${pluginNamespace}/require-theme-inline`,
  () => {
    return (root, result) => {
      const source = getStylesheetSource(root);

      if (!isGlobalsStylesheet(source)) {
        return;
      }

      let hasThemeInline = false;

      root.walkAtRules("theme", (themeRule) => {
        if (/\binline\b/.test(themeRule.params)) {
          hasThemeInline = true;
        }
      });

      if (!hasThemeInline) {
        report(
          result,
          `${pluginNamespace}/require-theme-inline`,
          root,
          `globals.css must declare @theme inline to map semantic CSS variables to Tailwind utilities`,
        );
      }
    };
  },
);

const requireThemeInlineMappings = stylelint.createPlugin(
  `${pluginNamespace}/require-theme-inline-mappings`,
  () => {
    return (root, result) => {
      const source = getStylesheetSource(root);

      if (!isGlobalsStylesheet(source)) {
        return;
      }

      root.walkAtRules("theme", (themeRule) => {
        if (!/\binline\b/.test(themeRule.params)) {
          return;
        }

        const blockSource = themeRule.toString();

        for (const mapping of REQUIRED_THEME_INLINE_MAPPINGS) {
          if (!blockSource.includes(mapping)) {
            report(
              result,
              `${pluginNamespace}/require-theme-inline-mappings`,
              themeRule,
              `globals.css @theme inline missing required mapping: ${mapping}`,
            );
          }
        }
      });
    };
  },
);

const tailwindImportOnlyInGlobals = stylelint.createPlugin(
  `${pluginNamespace}/tailwind-import-only-in-globals`,
  () => {
    return (root, result) => {
      const source = getStylesheetSource(root);

      root.walkAtRules("import", (importRule) => {
        const params = importRule.params.replace(/["']/g, "").trim();

        if (params !== "tailwindcss") {
          return;
        }

        if (!isGlobalsStylesheet(source)) {
          report(
            result,
            `${pluginNamespace}/tailwind-import-only-in-globals`,
            importRule,
            `@import "tailwindcss" is allowed only in globals.css — extension stylesheets must inherit the pipeline from globals.css`,
          );
        }
      });
    };
  },
);

export default [
  noRootInLayerBase,
  noDarkNestedTheme,
  noHslVarWrap,
  themeInlineUsesVar,
  tokenSourcesUseOklchOrVar,
  previewCssPipeline,
  utilityUsesDeclarations,
  requireCustomVariantDark,
  requireTopLevelRootDark,
  requireThemeInline,
  requireThemeInlineMappings,
  tailwindImportOnlyInGlobals,
];
