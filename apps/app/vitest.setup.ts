import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverMock;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      /* legacy matchMedia API */
    },
    removeListener: () => {
      /* legacy matchMedia API */
    },
  }),
});
