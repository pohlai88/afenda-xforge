import { test as nodeTest } from "node:test";

type TestFunction = typeof nodeTest;

const runtimeTest = (globalThis as typeof globalThis & { test?: TestFunction })
  .test;

export const test: TestFunction = runtimeTest ?? nodeTest;
