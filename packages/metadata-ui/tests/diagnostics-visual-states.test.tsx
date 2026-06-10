import assert from "node:assert/strict";
import type { ReactElement } from "react";
import { createMissingFieldRenderer } from "../src/adapters/fallbacks";
import {
  composeMetadataWithDiagnostics,
  MetadataDiagnosticsCorrelationFooter,
  MetadataDiagnosticsPanel,
  renderMetadataFormResult,
} from "../src/components";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { ErrorState } from "../src/renderers/states/error-state.renderer";
import { MetadataStateShell } from "../src/renderers/states/metadata-state-shell";
import {
  DIAGNOSTICS_VISUAL_DEFINITION,
  filterUiVisibleDiagnostics,
  resolveDiagnosticsPanelProps,
  shouldSurfaceDiagnostics,
} from "../src/visualization/diagnostics-visual-contract";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const normalizeChildren = (children: unknown): unknown[] => {
  if (children === null || children === undefined) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
};

const expandDiagnosticsTree = (node: unknown): unknown => {
  if (!node || typeof node !== "object" || !("type" in node)) {
    return node;
  }

  const element = node as TestElement;
  let expanded: unknown = element;

  if (element.type === MetadataDiagnosticsPanel) {
    expanded = MetadataDiagnosticsPanel(element.props);
  } else if (element.type === MetadataDiagnosticsCorrelationFooter) {
    expanded = MetadataDiagnosticsCorrelationFooter(element.props);
  } else if (element.type === MetadataStateShell) {
    expanded = MetadataStateShell(element.props);
  } else if (element.type === ErrorState) {
    expanded = ErrorState(element.props);
  }

  if (!expanded || typeof expanded !== "object" || !("props" in expanded)) {
    return expanded;
  }

  const expandedElement = expanded as TestElement;
  const children = normalizeChildren(expandedElement.props?.children).map(
    expandDiagnosticsTree
  );

  return {
    ...expandedElement,
    props: {
      ...expandedElement.props,
      children: children.length === 1 ? children[0] : children,
    },
  };
};

const findElementByProp = (
  node: unknown,
  propName: string,
  propValue: string
): TestElement | undefined => {
  const expandedNode = expandDiagnosticsTree(node);

  if (
    !expandedNode ||
    typeof expandedNode !== "object" ||
    !("props" in expandedNode)
  ) {
    return;
  }

  const element = expandedNode as TestElement;

  if (element.props?.[propName] === propValue) {
    return element;
  }

  for (const child of normalizeChildren(element.props?.children)) {
    const match = findElementByProp(child, propName, propValue);

    if (match) {
      return match;
    }
  }

  return;
};

test("filterUiVisibleDiagnostics keeps warning and error severities only", () => {
  const filtered = filterUiVisibleDiagnostics([
    {
      code: "missing-renderer",
      correlationId: "corr-1",
      message: "warning path",
      severity: "warning",
    },
    {
      code: "renderer-error",
      correlationId: "corr-1",
      message: "error path",
      severity: "error",
    },
    {
      code: "missing-renderer",
      correlationId: "corr-1",
      message: "telemetry only",
      severity: "info",
    },
  ]);

  assert.equal(filtered.length, 2);
});

test("shouldSurfaceDiagnostics requires diagnosticsEnabled and visible diagnostics", () => {
  const context = createMetadataRenderContext(
    { correlationId: "corr-enabled", diagnosticsEnabled: true },
    { mode: "read" }
  );
  const disabledContext = createMetadataRenderContext(
    { correlationId: "corr-disabled", diagnosticsEnabled: false },
    { mode: "read" }
  );
  const diagnostics = [
    {
      code: "missing-permission" as const,
      correlationId: "corr-enabled",
      message: "Denied",
      severity: "warning" as const,
    },
  ];

  assert.equal(shouldSurfaceDiagnostics(context, diagnostics), true);
  assert.equal(shouldSurfaceDiagnostics(disabledContext, diagnostics), false);
});

test("MetadataDiagnosticsPanel renders correlation ID and diagnostic entries", () => {
  const context = createMetadataRenderContext(
    { correlationId: "corr-panel", diagnosticsEnabled: true },
    { mode: "read" }
  );
  const tree = MetadataDiagnosticsPanel({
    context,
    diagnostics: [
      {
        code: "missing-permission",
        correlationId: "corr-panel",
        message: "Field denied",
        severity: "warning",
        target: "name",
      },
    ],
  }) as TestElement;

  assert.ok(findElementByProp(tree, "data-diagnostics-panel", "true"));
  assert.ok(findElementByProp(tree, "data-correlation-id", "corr-panel"));
  assert.match(
    String(tree.props?.className ?? ""),
    /metadata-diagnostics-panel/
  );
});

test("composeMetadataWithDiagnostics omits panel when diagnostics are disabled", () => {
  const context = createMetadataRenderContext(
    { correlationId: "corr-hidden", diagnosticsEnabled: false },
    { mode: "read" }
  );
  const tree = composeMetadataWithDiagnostics(
    context,
    (<div>content</div>) as ReactElement,
    [
      {
        code: "missing-permission",
        correlationId: "corr-hidden",
        message: "Denied",
        severity: "warning",
      },
    ]
  );

  assert.equal(
    findElementByProp(tree, "data-diagnostics-panel", "true"),
    undefined
  );
});

test("renderMetadataFormResult surfaces diagnostics panel when enabled", () => {
  const result = renderMetadataFormResult({
    context: {
      correlationId: "corr-form",
      diagnosticsEnabled: true,
    },
    fields: [
      {
        key: "employeeStatus",
        kind: "text",
        label: "Status",
        permission: "employee.write",
      },
    ],
    state: "ready",
  });

  assert.equal(result.diagnostics.length > 0, true);
  assert.equal(result.diagnostics[0]?.code, "missing-permission");
  assert.ok(
    findElementByProp(result.element, "data-diagnostics-enabled", "true")
  );
  assert.ok(
    findElementByProp(result.element, "data-diagnostics-panel", "true")
  );
  assert.ok(
    findElementByProp(result.element, "data-correlation-id", "corr-form")
  );
});

test("ErrorState applies fallback diagnostics shell and correlation footer", () => {
  const context = createMetadataRenderContext(
    { correlationId: "corr-fallback", diagnosticsEnabled: true },
    { mode: "read" }
  );
  const tree = expandDiagnosticsTree(
    ErrorState({
      context,
      correlationId: "corr-fallback",
      description: "Missing renderer",
      title: "Unsupported field",
    })
  ) as TestElement;

  assert.ok(findElementByProp(tree, "data-fallback-surface", "true"));
  assert.match(
    String(tree.props?.className ?? ""),
    new RegExp(
      DIAGNOSTICS_VISUAL_DEFINITION.fallbackShellClass.split(" ")[0] ?? ""
    )
  );
  assert.ok(findElementByProp(tree, "data-correlation-id", "corr-fallback"));
});

test("missing field fallback passes correlation ID into ErrorState", () => {
  const context = createMetadataRenderContext(
    { correlationId: "corr-field", diagnosticsEnabled: true },
    { mode: "read" }
  );
  const diagnostic = {
    code: "missing-renderer" as const,
    correlationId: "corr-field",
    fallback: true as const,
    message: "No renderer",
    rendererType: "field" as const,
    severity: "error" as const,
  };
  const tree = createMissingFieldRenderer(diagnostic)({
    context,
    field: {
      key: "legacy",
      kind: "legacy" as never,
      label: "Legacy",
    },
  }) as TestElement;

  assert.ok(findElementByProp(tree, "data-fallback-surface", "true"));
  assert.ok(findElementByProp(tree, "data-correlation-id", "corr-field"));
});

test("resolveDiagnosticsPanelProps exposes panel marker", () => {
  assert.deepEqual(resolveDiagnosticsPanelProps(), {
    "data-diagnostics-panel": "true",
  });
});
