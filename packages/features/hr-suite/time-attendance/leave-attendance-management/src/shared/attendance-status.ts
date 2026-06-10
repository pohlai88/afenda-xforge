export const lamAttendanceStatusAliases = {
  holiday: "public_holiday",
} as const;

export const normalizeAttendanceStatusInput = (value: unknown): unknown => {
  const snakeCase =
    typeof value === "string" ? value.replaceAll("-", "_") : value;

  if (
    typeof snakeCase === "string" &&
    snakeCase in lamAttendanceStatusAliases
  ) {
    return lamAttendanceStatusAliases[
      snakeCase as keyof typeof lamAttendanceStatusAliases
    ];
  }

  return snakeCase;
};

export const lamAttendanceStatusLabels = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  early_out: "Early Out",
  half_day: "Half Day",
  rest_day: "Rest Day",
  off_day: "Off Day",
  public_holiday: "Holiday",
  missing_punch: "Missing Punch",
} as const;
