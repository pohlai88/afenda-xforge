import assert from "node:assert/strict";
import type { ReactElement } from "react";

import {
  MetadataStateBoundary,
  renderMetadataStateBoundaryResult,
} from "../src/components";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

test("MetadataStateBoundary renders loading state", () => {
  const element = MetadataStateBoundary({ state: "loading" }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "LoadingState");
});

test("MetadataStateBoundary renders empty state", () => {
  const element = MetadataStateBoundary({
    emptyDescription: "No records yet.",
    emptyTitle: "Nothing here",
    state: "empty",
  }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "EmptyState");
});

test("MetadataStateBoundary renders error state", () => {
  const element = MetadataStateBoundary({
    error: "Unable to load records.",
    state: "error",
  }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "ErrorState");
});

test("MetadataStateBoundary renders forbidden state", () => {
  const element = MetadataStateBoundary({ state: "forbidden" }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "ForbiddenState");
});

test("MetadataStateBoundary renders ready children", () => {
  const element = MetadataStateBoundary({
    children: <span>ready</span>,
    state: "ready",
  }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "ReadyState");
  assert.equal((element.props.children as TestElement).type, "span");
});

test("renderMetadataStateBoundaryResult exposes fallback diagnostics", () => {
  const result = renderMetadataStateBoundaryResult({
    state: "mystery" as never,
  });

  assert.equal((result.element as TestElement).type.name, "ErrorState");
  assert.equal(result.diagnostics.length > 0, true);
  assert.equal(result.diagnostics[0]?.code, "unsupported-state");
});

test("renderMetadataStateBoundaryResult passes context to error renderer", () => {
  const result = renderMetadataStateBoundaryResult({
    context: {
      correlationId: "corr-state-boundary-error",
      diagnosticsEnabled: true,
    },
    error: "Load failed.",
    state: "error",
  });

  const element = result.element as TestElement;
  assert.equal(element.type.name, "ErrorState");
  assert.equal(
    element.props.context?.correlationId,
    "corr-state-boundary-error"
  );
});
