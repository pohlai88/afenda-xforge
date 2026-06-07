export type AuditSnapshot<TRecord> = {
  after: TRecord;
  before: TRecord;
};

export const createAuditSnapshot = <TRecord>(
  before: TRecord,
  after: TRecord
): AuditSnapshot<TRecord> => ({
  after,
  before,
});
