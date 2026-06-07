export const VIETNAMESE_HOLIDAYS_2024 = {
  liberationDay: "2024-04-30",
  newYear: "2024-01-01",
  nationalDay: "2024-09-02",
  reunificationHoliday: "2024-05-01",
  tetApproxStart: "2024-02-08",
} as const;

export const formatDateVN = (date: Date): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Date must be valid");
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatDateDDMMYYYY = (date: Date): string => {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateISO = (date: Date): string =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;

export const parseVNDate = (dateString: string): Date => {
  const trimmed = dateString.trim();

  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/u.exec(trimmed);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10)
    );
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid Vietnamese date: ${dateString}`);
  }

  return parsed;
};

export const isVietnamHoliday = (date: Date): boolean => {
  const isoDate = formatDateISO(date);
  return Object.values(VIETNAMESE_HOLIDAYS_2024).includes(
    isoDate as (typeof VIETNAMESE_HOLIDAYS_2024)[keyof typeof VIETNAMESE_HOLIDAYS_2024]
  );
};
