import { VNVATRate } from "../types.ts";

const VAT_CATEGORY_MAP: Record<string, VNVATRate> = {
  AGRICULTURAL_PRODUCTS: VNVATRate.REDUCED,
  COAL: VNVATRate.SPECIAL,
  EDUCATION: VNVATRate.ZERO,
  EXPORT: VNVATRate.ZERO,
  FINANCIAL_SERVICES: VNVATRate.ZERO,
  FOOD_PRODUCTS: VNVATRate.REDUCED,
  GENERAL: VNVATRate.STANDARD,
  HEALTHCARE: VNVATRate.ZERO,
  MANUFACTURING: VNVATRate.STANDARD,
  MEDICINE: VNVATRate.REDUCED,
  RETAIL: VNVATRate.STANDARD,
  SERVICES: VNVATRate.STANDARD,
  WHOLESALE: VNVATRate.STANDARD,
};

export const calculateVAT = (amount: number, rate: VNVATRate): number => {
  if (amount < 0) {
    throw new Error("Amount must be non-negative");
  }

  return Math.round((amount * rate) / 100);
};

export const calculateAmountWithVAT = (
  amount: number,
  rate: VNVATRate
): number => amount + calculateVAT(amount, rate);

export const calculateBaseAmountFromTotal = (
  total: number,
  rate: VNVATRate
): number => {
  if (rate === VNVATRate.ZERO) {
    return total;
  }

  return Math.round((total * 100) / (100 + rate));
};

export const getVNVATRateForCategory = (category: string): VNVATRate =>
  VAT_CATEGORY_MAP[category.toUpperCase()] ?? VNVATRate.STANDARD;

export const isVNVATExempt = (category: string): boolean =>
  getVNVATRateForCategory(category) === VNVATRate.ZERO;

export type VNVATLineItem = {
  amount: number;
  rate: VNVATRate;
  vatAmount: number;
  totalWithVAT: number;
};

export const calculateVNVATLineItem = (
  amount: number,
  rate: VNVATRate
): VNVATLineItem => ({
  amount,
  rate,
  totalWithVAT: amount + calculateVAT(amount, rate),
  vatAmount: calculateVAT(amount, rate),
});

export const aggregateVNVAT = (
  items: readonly VNVATLineItem[]
): {
  totalAfterVAT: number;
  totalBeforeVAT: number;
  totalVAT: number;
} => ({
  totalAfterVAT: items.reduce((sum, item) => sum + item.totalWithVAT, 0),
  totalBeforeVAT: items.reduce((sum, item) => sum + item.amount, 0),
  totalVAT: items.reduce((sum, item) => sum + item.vatAmount, 0),
});
