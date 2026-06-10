export type MetadataRendererVersionConstraint = {
  exact?: string;
  min?: string;
};

export type MetadataRendererVersionParts = readonly [
  major: number,
  minor: number,
  patch: number,
];

export function parseRendererVersion(
  version: string
): MetadataRendererVersionParts {
  const [major = 0, minor = 0, patch = 0] = version
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));

  return [major, minor, patch];
}

export function compareRendererVersions(
  left: string,
  right: string
): -1 | 0 | 1 {
  const [lMajor, lMinor, lPatch] = parseRendererVersion(left);
  const [rMajor, rMinor, rPatch] = parseRendererVersion(right);

  if (lMajor !== rMajor) {
    return lMajor > rMajor ? 1 : -1;
  }

  if (lMinor !== rMinor) {
    return lMinor > rMinor ? 1 : -1;
  }

  if (lPatch !== rPatch) {
    return lPatch > rPatch ? 1 : -1;
  }

  return 0;
}

export function satisfiesRendererVersionConstraint(
  registrationVersion: string,
  constraint: MetadataRendererVersionConstraint | undefined
): boolean {
  if (!constraint) {
    return true;
  }

  if (constraint.exact) {
    return registrationVersion === constraint.exact;
  }

  if (
    constraint.min &&
    compareRendererVersions(registrationVersion, constraint.min) < 0
  ) {
    return false;
  }

  return true;
}
