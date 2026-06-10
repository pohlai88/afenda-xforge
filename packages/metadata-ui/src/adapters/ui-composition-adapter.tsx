import type { ReactElement } from "react";

import type {
  MetadataCompositionContract,
  MetadataCompositionNode,
} from "../contracts/composition.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import { validateMetadataCompositionContract } from "./contract-validation";
import type { MetadataRendererDiagnostic } from "./diagnostics";
import {
  bindRendererDiagnosticCorrelation,
  createInvalidContractDiagnostic,
  mergeRendererDiagnostics,
} from "./diagnostics";
import { createInvalidContractFallbackResult } from "./invalid-contract-fallback";
import { emitMetadataTelemetry } from "./telemetry.ts";

export type MetadataCompositionNodeResolver = (
  node: MetadataCompositionNode,
  context: MetadataRenderContext
) => MetadataRenderAdapterResult<ReactElement | null>;

export type MetadataCompositionAdapterProps = {
  composition: MetadataCompositionContract;
  context: MetadataRenderContext;
  resolveNode: MetadataCompositionNodeResolver;
};

const findCompositionNode = (
  nodes: readonly MetadataCompositionNode[],
  key: string
): MetadataCompositionNode | undefined => {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
  }

  for (const node of nodes) {
    if (!node.children) {
      continue;
    }

    const nested = findCompositionNode(node.children, key);

    if (nested) {
      return nested;
    }
  }

  return;
};

const renderCompositionNode = (
  node: MetadataCompositionNode,
  context: MetadataRenderContext,
  resolveNode: MetadataCompositionNodeResolver
): MetadataRenderAdapterResult<ReactElement | null> => {
  const resolved = resolveNode(node, context);
  const childResults =
    node.children?.map((child) =>
      renderCompositionNode(child, context, resolveNode)
    ) ?? [];
  const diagnostics = mergeRendererDiagnostics(
    resolved.diagnostics as readonly MetadataRendererDiagnostic[],
    ...childResults.map(
      (result) => result.diagnostics as readonly MetadataRendererDiagnostic[]
    )
  );

  if (childResults.length === 0) {
    return { diagnostics, element: resolved.element };
  }

  return {
    diagnostics,
    element: (
      <>
        {resolved.element}
        {childResults.map((result, index) => (
          <div key={node.children?.[index]?.key ?? index}>{result.element}</div>
        ))}
      </>
    ),
  };
};

export function renderMetadataComposition({
  composition,
  context,
  resolveNode,
}: MetadataCompositionAdapterProps): MetadataRenderAdapterResult<ReactElement | null> {
  const contractValidation = validateMetadataCompositionContract(composition);

  if (!contractValidation.valid && contractValidation.diagnostic) {
    const diagnostic = bindRendererDiagnosticCorrelation(
      contractValidation.diagnostic,
      context.correlationId
    ) as MetadataRendererDiagnostic;

    return createInvalidContractFallbackResult(
      context,
      diagnostic,
      "Invalid composition contract",
      {
        attributes: {
          rootKey: composition?.rootKey ?? "unknown",
        },
        rendererKey: composition?.rootKey ?? "composition",
      }
    );
  }

  const rootNode = findCompositionNode(composition.nodes, composition.rootKey);

  if (!rootNode) {
    const diagnostic = bindRendererDiagnosticCorrelation(
      createInvalidContractDiagnostic(
        "composition",
        composition.rootKey,
        `Composition root '${composition.rootKey}' was not found in composition nodes.`
      ),
      context.correlationId
    ) as MetadataRendererDiagnostic;

    return createInvalidContractFallbackResult(
      context,
      diagnostic,
      "Invalid composition contract",
      {
        attributes: {
          rootKey: composition.rootKey,
        },
        rendererKey: composition.rootKey,
      }
    );
  }

  emitMetadataTelemetry(context, "metadata.composition.render.started", {
    attributes: {
      nodeCount: composition.nodes.length,
      rootKey: composition.rootKey,
      version: composition.version,
    },
    diagnostics: [],
    level: "debug",
    rendererKey: composition.rootKey,
  });

  const result = renderCompositionNode(rootNode, context, resolveNode);

  emitMetadataTelemetry(context, "metadata.composition.render.completed", {
    attributes: {
      rootKey: composition.rootKey,
    },
    diagnostics: result.diagnostics,
    level: "info",
    rendererKey: composition.rootKey,
  });

  return result;
}
