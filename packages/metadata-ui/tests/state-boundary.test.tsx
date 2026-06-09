import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReactElement } from "react";

import { MetadataStateBoundary } from "../src/components";

type TestElement = ReactElement<any, any>;

test("MetadataStateBoundary renders loading state", () => {
  const element = MetadataStateBoundary({ state: "loading" }) as TestElement;

  assert.equal((element.type as { name?: string }).name, "LoadingState");
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
