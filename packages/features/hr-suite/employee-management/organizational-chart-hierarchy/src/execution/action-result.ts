export function toOrgActionFailure(error: unknown): {
  ok: false;
  error: string;
} {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "Unexpected organizational chart failure" };
}
