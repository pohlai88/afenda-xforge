import type { EntityMetadata } from "@repo/metadata";
import {
  createMetadataRenderContext,
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
  EntityMetadataPanel,
  MetadataForm,
  MetadataSectionStack,
  MetadataStateBoundary,
} from "@repo/metadata-ui";
import type {
  MetadataActionContract,
  MetadataConsumerScenarioDefinition,
  MetadataConsumerScenarioResult,
  MetadataFieldContract,
  MetadataSectionContract,
} from "@repo/metadata-ui/contracts";
import type { DashboardTableRow } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";

const metadata: EntityMetadata = {
  entity: "invoice",
  id: "billing.invoices",
  labels: {
    plural: "Invoices",
    singular: "Invoice",
  },
  table: {
    columns: [
      {
        field: "number",
        key: "number",
        label: "Invoice",
      },
      {
        field: "status",
        key: "status",
        kind: "status",
        label: "Status",
      },
    ],
    defaultSort: "number",
  },
  title: "Invoices",
};

const rows: readonly DashboardTableRow[] = [
  {
    id: "inv-001",
    number: "INV-001",
    status: "active",
  },
];

const actions: readonly MetadataActionContract[] = [
  {
    fallback: "disable",
    featureFlag: "billing-editor",
    key: "save",
    kind: "update",
    label: "Save",
  },
];

const fields: readonly MetadataFieldContract[] = [
  {
    fallback: "disable",
    featureFlag: "billing-editor",
    key: "name",
    kind: "text",
    label: "Name",
  },
];

const sections: readonly MetadataSectionContract<
  EntityMetadata,
  DashboardTableRow
>[] = [
  {
    fields,
    key: "profile",
    kind: "form",
    title: "Profile",
  },
  {
    key: "table",
    kind: "table",
    metadata,
    rows,
    title: "Records",
  },
];

export const metadataConsumerScenarioMatrix: readonly MetadataConsumerScenarioDefinition[] =
  [
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "create-ready",
      mode: "create",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "read-ready",
      mode: "read",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "update-ready",
      mode: "update",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "review-ready",
      mode: "review",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: true,
      featureFlags: { "billing-editor": true },
      id: "readonly-review",
      mode: "review",
      permissions: { "invoice.update": true },
      readonly: true,
    },
    {
      expectedDisabled: true,
      featureFlags: {},
      id: "feature-flag-denied",
      mode: "update",
      permissions: { "invoice.update": true },
    },
  ];

type StaticElementProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

const staticRenderableComponentNames = new Set([
  "BaseActionRenderer",
  "ButtonActionRenderer",
  "CheckboxFieldRenderer",
  "DateFieldRenderer",
  "ErrorState",
  "ForbiddenState",
  "LoadingState",
  "MetadataForm",
  "MetadataFormSectionRenderer",
  "MetadataSectionRenderer",
  "MetadataSectionStack",
  "MetadataTableSectionRenderer",
  "MetadataStateBoundary",
  "MetadataToolbar",
  "MoneyFieldRenderer",
  "NumberFieldRenderer",
  "SelectFieldRenderer",
  "SwitchFieldRenderer",
  "TextFieldRenderer",
  "TextareaFieldRenderer",
]);

const canRenderStaticComponent = (
  componentName: string | undefined
): boolean =>
  componentName ? staticRenderableComponentNames.has(componentName) : false;

const toArray = (value: ReactNode): readonly ReactNode[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null) {
    return [];
  }

  return [value];
};

function renderStaticNode(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    return node.map(renderStaticNode);
  }

  if (!isValidElement<StaticElementProps>(node)) {
    return node;
  }

  const element = node as ReactElement<StaticElementProps>;
  const { type, props } = element;

  if (typeof type === "function") {
    return renderStaticComponent(
      element,
      type.name,
      type as (nextProps: StaticElementProps) => ReactNode,
      props
    );
  }

  if (typeof type === "object" && type !== null) {
    const wrappedType = type as {
      render?: (nextProps: StaticElementProps, nextRef: null) => ReactNode;
      type?: unknown;
    };

    if (typeof wrappedType.type === "function") {
      return renderStaticComponent(
        element,
        wrappedType.type.name,
        wrappedType.type as (nextProps: StaticElementProps) => ReactNode,
        props
      );
    }

    if (typeof wrappedType.render === "function") {
      return renderStaticRenderFunction(element, wrappedType.render, props);
    }
  }

  return element;
}

function renderStaticComponent(
  element: ReactElement<StaticElementProps>,
  componentName: string | undefined,
  component: (nextProps: StaticElementProps) => ReactNode,
  props: StaticElementProps
): ReactNode {
  if (!canRenderStaticComponent(componentName)) {
    return element;
  }

  try {
    return renderStaticNode(component(props));
  } catch {
    return element;
  }
}

function renderStaticRenderFunction(
  element: ReactElement<StaticElementProps>,
  render: (nextProps: StaticElementProps, nextRef: null) => ReactNode,
  props: StaticElementProps
): ReactNode {
  try {
    return renderStaticNode(render(props, null));
  } catch {
    return element;
  }
}

const getElementProps = (node: ReactNode): StaticElementProps | null => {
  const resolvedNode = renderStaticNode(node);

  if (!isValidElement<StaticElementProps>(resolvedNode)) {
    return null;
  }

  return resolvedNode.props;
};

function collectElementText(node: ReactNode): string {
  const resolvedNode = renderStaticNode(node);

  if (
    typeof resolvedNode === "string" ||
    typeof resolvedNode === "number" ||
    typeof resolvedNode === "boolean"
  ) {
    return String(resolvedNode);
  }

  const props = getElementProps(resolvedNode);

  if (!props) {
    return "";
  }

  const children = toArray(props.children as ReactNode);

  return children.map((child) => collectElementText(child)).join(" ");
}

function elementHasDisabledControl(node: ReactNode): boolean {
  const resolvedNode = renderStaticNode(node);
  const props = getElementProps(resolvedNode);

  if (!props) {
    return false;
  }

  if (props.disabled === true || props["aria-disabled"] === true) {
    return true;
  }

  return toArray(props.children as ReactNode).some((child) =>
    elementHasDisabledControl(child)
  );
}

function elementIncludesTitle(node: ReactNode, title: string): boolean {
  const resolvedNode = renderStaticNode(node);
  const props = getElementProps(resolvedNode);

  if (!props) {
    return false;
  }

  if (props.title === title) {
    return true;
  }

  return toArray(props.children as ReactNode).some((child) =>
    elementIncludesTitle(child, title)
  );
}

function elementIncludesActionLabel(node: ReactNode, label: string): boolean {
  const props = getElementProps(node);

  if (!props) {
    return false;
  }

  const action =
    "action" in props
      ? (props.action as { label?: unknown } | undefined)
      : undefined;

  if (action?.label === label) {
    return true;
  }

  if (collectElementText(node).includes(label)) {
    return true;
  }

  return toArray(props.children as ReactNode).some((child) =>
    elementIncludesActionLabel(child, label)
  );
}

function runMetadataConsumerScenario(
  scenario: MetadataConsumerScenarioDefinition
): MetadataConsumerScenarioResult {
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
  const form = MetadataForm({
    actions,
    context,
    fields,
    title: "Profile",
    values: {
      name: "Acme Billing",
    },
  });
  const stack = MetadataSectionStack({
    context,
    sections,
  });
  const stateBoundary = MetadataStateBoundary({
    children: <div>Ready content</div>,
    context,
    state: "ready",
  });

  return {
    containsActionLabel: elementIncludesActionLabel(form, "Save"),
    containsDisabledControl: elementHasDisabledControl(form),
    formText: collectElementText(form),
    id: scenario.id,
    mode: scenario.mode,
    readonly: scenario.readonly ?? false,
    sectionText: elementIncludesTitle(stack, "Records")
      ? "Records"
      : collectElementText(stack),
    stateText: collectElementText(stateBoundary),
  };
}

export function runPublicApiConsumerSmoke(): {
  compatibilityOk: boolean;
  formType: unknown;
  panelType: unknown;
  qualityGrade: string;
  scenarios: readonly MetadataConsumerScenarioResult[];
  sectionStackType: unknown;
  stateBoundaryType: unknown;
} {
  const context = createMetadataRenderContext(
    {
      permissions: {
        "invoice.update": true,
      },
    },
    {
      mode: "update",
    }
  );
  const compatibility = createMetadataUiCompatibilityReport();
  const quality = createMetadataUiQualityAssessment({
    compatibility,
    defaultRendererCoverage: true,
    governanceFallbackCoverage: true,
    gracefulUnknownFallbacks: true,
    telemetryCorrelationCoverage: true,
    verification: {
      boundaryLint: true,
      lint: true,
      test: true,
      typecheck: true,
    },
  });

  const form = MetadataForm({
    actions,
    context,
    fields,
  }) as ReactElement;
  const stack = MetadataSectionStack({
    context,
    sections,
  }) as ReactElement;
  const stateBoundary = MetadataStateBoundary({
    context,
    state: "ready",
  }) as ReactElement | null;
  const panel = EntityMetadataPanel({
    context,
    metadata,
    rows,
  }) as ReactElement;
  const scenarios = metadataConsumerScenarioMatrix.map(
    runMetadataConsumerScenario
  );

  return {
    compatibilityOk: compatibility.ok,
    formType: form.type,
    panelType: panel.type,
    qualityGrade: quality.grade,
    scenarios,
    sectionStackType: stack.type,
    stateBoundaryType: stateBoundary?.type ?? null,
  };
}
