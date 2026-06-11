export function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function resolveActiveNavItem<T extends { href: string }>(
  pathname: string,
  items: readonly T[]
): T | undefined {
  return items.find((item) => isPathActive(pathname, item.href));
}

export function resolveActiveFeatureId(
  pathname: string,
  items: readonly { featureId?: string; href: string }[],
  fallback: string
): string {
  return resolveActiveNavItem(pathname, items)?.featureId ?? fallback;
}
