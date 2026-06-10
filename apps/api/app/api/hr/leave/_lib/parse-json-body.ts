export type LamJsonBodyParseResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; error: "Invalid JSON request body" };

export const parseLamJsonBody = async (
  request: Request
): Promise<LamJsonBodyParseResult> => {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return { ok: false, error: "Invalid JSON request body" };
  }

  return { ok: true, body };
};
