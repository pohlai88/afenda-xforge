import "@testing-library/jest-dom/vitest";

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
