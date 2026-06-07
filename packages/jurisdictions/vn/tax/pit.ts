import type { VNPITBracket } from "../types.ts";

const PERSONAL_DEDUCTION = 11_000_000;
const DEPENDENT_DEDUCTION = 4_400_000;

const PIT_BRACKETS: VNPITBracket[] = [
  { fromIncome: 0, toIncome: 5_000_000, rate: 5, deductionAmount: 0 },
  {
    fromIncome: 5_000_000,
    toIncome: 10_000_000,
    rate: 10,
    deductionAmount: 250_000,
  },
  {
    fromIncome: 10_000_000,
    toIncome: 18_000_000,
    rate: 15,
    deductionAmount: 750_000,
  },
  {
    fromIncome: 18_000_000,
    toIncome: 32_000_000,
    rate: 20,
    deductionAmount: 1_950_000,
  },
  {
    fromIncome: 32_000_000,
    toIncome: 52_000_000,
    rate: 25,
    deductionAmount: 4_750_000,
  },
  {
    fromIncome: 52_000_000,
    toIncome: 80_000_000,
    rate: 30,
    deductionAmount: 9_750_000,
  },
  {
    fromIncome: 80_000_000,
    toIncome: Number.MAX_SAFE_INTEGER,
    rate: 35,
    deductionAmount: 18_150_000,
  },
];

const getPITBracket = (income: number): VNPITBracket =>
  PIT_BRACKETS.find(
    (bracket) => income >= bracket.fromIncome && income < bracket.toIncome
  ) ??
  PIT_BRACKETS.at(-1) ?? {
    deductionAmount: 0,
    fromIncome: 0,
    rate: 0,
    toIncome: Number.MAX_SAFE_INTEGER,
  };

export const calculateVNTaxableIncome = (
  grossIncome: number,
  dependents = 0,
  additionalDeductions = 0
): number => {
  if (grossIncome < 0 || dependents < 0) {
    throw new Error("Gross income and dependents must be non-negative");
  }

  const totalDeductions =
    PERSONAL_DEDUCTION +
    dependents * DEPENDENT_DEDUCTION +
    additionalDeductions;

  return Math.max(0, Math.round(grossIncome - totalDeductions));
};

const calculatePITFromTaxable = (taxableIncome: number): number => {
  if (taxableIncome <= 0) {
    return 0;
  }

  const bracket = getPITBracket(taxableIncome);
  const incomeInBracket = taxableIncome - bracket.fromIncome;
  return (
    bracket.deductionAmount + Math.round((incomeInBracket * bracket.rate) / 100)
  );
};

export const calculateVNPIT = (
  grossIncome: number,
  dependents = 0,
  additionalDeductions = 0
): number =>
  calculatePITFromTaxable(
    calculateVNTaxableIncome(grossIncome, dependents, additionalDeductions)
  );

export const calculateVNPITDetailed = (
  grossIncome: number,
  dependents = 0,
  additionalDeductions = 0
): {
  additionalDeductions: number;
  dependentDeduction: number;
  grossIncome: number;
  netIncome: number;
  personalDeduction: number;
  pitTax: number;
  taxRate: number;
  taxableIncome: number;
} => {
  const taxableIncome = calculateVNTaxableIncome(
    grossIncome,
    dependents,
    additionalDeductions
  );
  const pitTax = calculatePITFromTaxable(taxableIncome);
  const taxRate =
    grossIncome > 0 ? Math.round((pitTax / grossIncome) * 10_000) / 100 : 0;

  return {
    additionalDeductions,
    dependentDeduction: dependents * DEPENDENT_DEDUCTION,
    grossIncome,
    netIncome: grossIncome - pitTax,
    personalDeduction: PERSONAL_DEDUCTION,
    pitTax,
    taxRate,
    taxableIncome,
  };
};

export const listVNPITBrackets = (): VNPITBracket[] => [...PIT_BRACKETS];
