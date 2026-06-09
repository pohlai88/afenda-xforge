export function maskHrEmployeeSensitiveEmail(
  value: string | null | undefined,
  canViewSensitive: boolean
): string {
  if (canViewSensitive || !value) {
    return value ?? "";
  }

  const [local, domain] = value.split("@");
  if (!(local && domain)) {
    return "hidden";
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

export function maskHrEmployeeSensitiveIdentity(
  value: string | null | undefined,
  canViewSensitive: boolean
): string {
  if (canViewSensitive || !value) {
    return value ?? "";
  }

  return `${value.slice(0, 2)}***`;
}

export function maskHrEmployeeSensitivePhone(
  value: string | null | undefined,
  canViewSensitive: boolean
): string {
  if (canViewSensitive || !value) {
    return value ?? "";
  }

  return `${value.slice(0, 3)}***`;
}

export function maskHrEmployeeSensitiveAddress(
  value: string | null | undefined,
  canViewSensitive: boolean
): string {
  if (canViewSensitive || !value) {
    return value ?? "";
  }

  return "hidden";
}

export function maskHrEmployeeSensitiveDateOfBirth(
  value: Date | null | undefined,
  canViewSensitive: boolean
): string {
  if (canViewSensitive || !value) {
    return value ? value.toISOString().slice(0, 10) : "";
  }

  return "hidden";
}
