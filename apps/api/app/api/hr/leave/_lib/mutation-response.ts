export const mapLamMutationHttpStatus = (args: {
  ok: boolean;
  error?: string;
  successStatus?: number;
}): number => {
  if (args.ok) {
    return args.successStatus ?? 200;
  }

  const error = args.error ?? "";
  if (/access denied|scope|not permitted|does not match|not authorized|HR fallback delegation|disabled for this company/i.test(error)) {
    return 403;
  }

  if (
    /must be|required|invalid|insufficient|not found|already exists|already linked|maximum|minimum|notice|overlap|blackout|eligible|document|balance|active leave type|policy group|cannot be confirmed|approverRef|step order|approval route|pending approval|rejection reason|submitted status|actor employee identity|workflow step/i.test(
      error
    )
  ) {
    return 422;
  }

  return 400;
};
