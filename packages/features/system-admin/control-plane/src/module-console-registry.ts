import "server-only";

export type ModuleConsoleRegistrationStatus = "ready" | "deferred";

export type ModuleConsoleRegistration = Readonly<{
  apiBasePath: string;
  appBasePath: string;
  consoleId: string;
  defaultOperatorCapabilities?: readonly string[];
  domainWriteCapabilityPrefixes: readonly string[];
  operatorCapabilityPrefix: string;
  packageName: string;
  status: ModuleConsoleRegistrationStatus;
  suite: string;
  title: string;
}>;

let registeredModuleConsoles: ModuleConsoleRegistration[] = [];

export const bootstrapModuleConsoleRegistry = (
  registrations: readonly ModuleConsoleRegistration[]
): void => {
  registeredModuleConsoles = [...registrations];
};

export const resetModuleConsoleRegistryForTests = (): void => {
  registeredModuleConsoles = [];
};

export const listRegisteredModuleConsoles = (): ModuleConsoleRegistration[] =>
  [...registeredModuleConsoles];

export const findRegisteredModuleConsole = (
  consoleId: string
): ModuleConsoleRegistration | undefined =>
  registeredModuleConsoles.find((entry) => entry.consoleId === consoleId);

export const resolveDefaultModuleConsoleOperatorCapabilities = (
  consoleId: string
): string[] => {
  const registration = findRegisteredModuleConsole(consoleId);

  return registration?.defaultOperatorCapabilities
    ? [...registration.defaultOperatorCapabilities]
    : [];
};
