import "server-only";

export const runHrSuiteFeatureAction = <T>(operation: () => T): T =>
  operation();
