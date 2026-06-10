export type VnHrDocumentsDefaults = {
  alertWindowDays: number;
  retentionPeriodDays: number;
};

export function getVnHrDocumentsDefaults(): VnHrDocumentsDefaults {
  return {
    alertWindowDays: 30,
    retentionPeriodDays: 365,
  };
}
