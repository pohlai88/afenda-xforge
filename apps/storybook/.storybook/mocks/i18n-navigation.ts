import { createElement, type ComponentPropsWithoutRef, type ReactNode } from "react";

export function Link({
  children,
  href,
  ...props
}: {
  children: ReactNode;
  href: string;
} & Omit<ComponentPropsWithoutRef<"a">, "children" | "href">): ReactNode {
  return createElement("a", { href, ...props }, children);
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
