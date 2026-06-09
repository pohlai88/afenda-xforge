export type VersionedSecret = Readonly<{
  isActive: boolean;
  secret: string;
  version: string;
}>;

export const resolveActiveSecret = (
  secrets: readonly VersionedSecret[]
): VersionedSecret => {
  const activeSecret = secrets.find((secret) => secret.isActive);

  if (!activeSecret) {
    throw new Error("No active webhook secret configured");
  }

  return activeSecret;
};
