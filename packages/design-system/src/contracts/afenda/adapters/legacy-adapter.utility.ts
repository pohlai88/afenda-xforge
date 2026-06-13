export function validateLegacyAdapterRejectedPathsAlignment(
  rejectedPaths: readonly string[],
  forbiddenKeys: readonly string[],
  adapterLabel: string
): void {
  if (rejectedPaths.join("|") !== forbiddenKeys.join("|")) {
    throw new Error(
      `${adapterLabel} rejected authority paths must derive from AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS`
    );
  }
}
