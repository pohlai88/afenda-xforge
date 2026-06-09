export type EmptyState = {
  description: string;
  title: string;
  variant: "error" | "muted";
};

export async function settleOrgListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T> | T;
}): Promise<{ value?: T; loadError?: EmptyState }> {
  try {
    return { value: await input.load() };
  } catch {
    return {
      loadError: {
        variant: "error",
        title: `${input.sectionTitle} unavailable`,
        description:
          "This register could not be loaded. Refresh the page or try again later.",
      },
    };
  }
}
