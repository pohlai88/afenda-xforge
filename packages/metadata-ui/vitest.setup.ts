import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import { expect } from "vitest";
// biome-ignore lint/performance/noNamespaceImport: vitest-axe registers matchers as a single export object
import * as matchers from "vitest-axe/matchers";

expect.extend(matchers);

class ResizeObserverMock {
  observe(): void {
    /* jsdom polyfill */
  }

  unobserve(): void {
    /* jsdom polyfill */
  }

  disconnect(): void {
    /* jsdom polyfill */
  }
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
}
