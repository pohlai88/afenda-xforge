import type { ReactNode } from "react";

export function Link({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}): ReactNode {
  return <a href={href}>{children}</a>;
}

export function redirect(_href: string): never {
  throw new Error("redirect is not available in Storybook");
}

export function usePathname(): string {
  return "/dashboard";
}

export function useRouter(): {
  push: (href: string) => void;
  replace: (href: string) => void;
  refresh: () => void;
} {
  return {
    push: () => undefined,
    refresh: () => undefined,
    replace: () => undefined,
  };
}

export function getPathname(): string {
  return "/dashboard";
}
