const RESERVED_TENANT_HOSTS = new Set([
  "admin",
  "api",
  "app",
  "docs",
  "localhost",
  "studio",
  "www",
]);

export const resolveTenantSlugFromHost = (
  host: string,
  options: {
    appBaseDomain?: string;
    reservedHosts?: Iterable<string>;
  } = {}
): string | null => {
  const normalizedHost = host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");

  if (!normalizedHost) {
    return null;
  }

  const reservedHosts = new Set(options.reservedHosts ?? RESERVED_TENANT_HOSTS);
  const labels = normalizedHost.split(".").filter(Boolean);
  const appBaseDomain = options.appBaseDomain
    ?.trim()
    .toLowerCase()
    .replace(/^\./, "")
    .replace(/\.$/, "");

  if (appBaseDomain) {
    const baseLabels = appBaseDomain.split(".").filter(Boolean);
    const hostEndsWithBase = baseLabels.every(
      (label, index) =>
        labels[labels.length - baseLabels.length + index] === label
    );

    if (!(hostEndsWithBase && labels.length > baseLabels.length)) {
      return null;
    }

    const slug = labels.slice(0, labels.length - baseLabels.length).join(".");
    return reservedHosts.has(slug) ? null : slug;
  }

  if (labels.length < 2) {
    return null;
  }

  if (labels.length === 2 && labels[1] !== "localhost") {
    return null;
  }

  const slug = labels[0];
  return reservedHosts.has(slug) ? null : slug;
};
