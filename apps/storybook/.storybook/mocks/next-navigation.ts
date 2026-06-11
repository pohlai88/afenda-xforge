let mockPathname = "/theme-studio/executive-dashboard";

export function setStorybookPathname(pathname: string): void {
  mockPathname = pathname;
}

export function usePathname(): string {
  return mockPathname;
}

export function useRouter(): {
  push: (href: string) => void;
  refresh: () => void;
  replace: (href: string) => void;
} {
  return {
    push: (href: string) => {
      mockPathname = href;
    },
    refresh: () => undefined,
    replace: (href: string) => {
      mockPathname = href;
    },
  };
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams();
}

export function useParams(): Record<string, string | string[]> {
  return {};
}

export function redirect(): never {
  throw new Error("redirect is not available in Storybook");
}
