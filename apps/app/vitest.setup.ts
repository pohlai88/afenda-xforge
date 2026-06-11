import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe(): void {
    /* ResizeObserver mock */
  }
  unobserve(): void {
    /* ResizeObserver mock */
  }
  disconnect(): void {
    /* ResizeObserver mock */
  }
}

globalThis.ResizeObserver = ResizeObserverMock;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    addEventListener: () => {
      /* matchMedia mock */
    },
    removeEventListener: () => {
      /* matchMedia mock */
    },
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
