import type { PaginationMeta } from "./types.ts";

const createRandomSuffix = (): string => {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return randomUUID().replaceAll("-", "");
  }

  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
};

export const generateId = (prefix = "id"): string =>
  `${prefix}_${createRandomSuffix()}`;

export const generateCode = (
  prefix: string,
  sequence: number,
  padLength = 6
): string => `${prefix}-${String(sequence).padStart(padLength, "0")}`;

export const paginationMeta = (
  page: number,
  pageSize: number,
  total: number
): PaginationMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
});

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const truncate = (
  text: string,
  maxLength: number,
  suffix = "..."
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
};
