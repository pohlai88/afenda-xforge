import { VNCompanySize, VNPreferentialTaxZone } from "../types.ts";

const STANDARD_CIT_RATE = 20;
const SME_PREFERENTIAL_RATE = 10;
const TECH_PREFERENTIAL_RATE = 5;

const ZONE_RATES: Record<VNPreferentialTaxZone, number> = {
  [VNPreferentialTaxZone.HIGHLAND]: 10,
  [VNPreferentialTaxZone.EXTREME_DIFFICULTY]: 5,
  [VNPreferentialTaxZone.TECH_PARK]: 5,
  [VNPreferentialTaxZone.EXPORT_ZONE]: 8,
  [VNPreferentialTaxZone.FREE_TRADE_ZONE]: 8,
};

const determineCITRate = (
  companySize: VNCompanySize,
  preferentialZone?: VNPreferentialTaxZone,
  hasInvestmentIncentives = false
): number => {
  if (
    preferentialZone &&
    (hasInvestmentIncentives || ZONE_RATES[preferentialZone])
  ) {
    return ZONE_RATES[preferentialZone];
  }

  if (companySize === VNCompanySize.STARTUP) {
    return TECH_PREFERENTIAL_RATE;
  }

  if (
    companySize === VNCompanySize.MICRO ||
    companySize === VNCompanySize.SMALL ||
    companySize === VNCompanySize.MEDIUM
  ) {
    return SME_PREFERENTIAL_RATE;
  }

  return STANDARD_CIT_RATE;
};

export const calculateVNCIT = (
  taxableIncome: number,
  companySize: VNCompanySize = VNCompanySize.LARGE,
  preferentialZone?: VNPreferentialTaxZone,
  hasInvestmentIncentives = false
): number => {
  if (taxableIncome < 0) {
    throw new Error("Taxable income must be non-negative");
  }

  const rate = determineCITRate(
    companySize,
    preferentialZone,
    hasInvestmentIncentives
  );

  return Math.round((taxableIncome * rate) / 100);
};

export const calculateVNCITDetailed = (
  taxableIncome: number,
  companySize: VNCompanySize = VNCompanySize.LARGE,
  preferentialZone?: VNPreferentialTaxZone,
  hasInvestmentIncentives = false
): {
  afterTaxIncome: number;
  citAmount: number;
  rate: number;
  taxableIncome: number;
} => {
  const citAmount = calculateVNCIT(
    taxableIncome,
    companySize,
    preferentialZone,
    hasInvestmentIncentives
  );
  const rate = determineCITRate(
    companySize,
    preferentialZone,
    hasInvestmentIncentives
  );

  return {
    afterTaxIncome: taxableIncome - citAmount,
    citAmount,
    rate,
    taxableIncome,
  };
};

export const getVNCITRate = (
  companySize: VNCompanySize,
  preferentialZone?: VNPreferentialTaxZone,
  hasInvestmentIncentives = false
): number =>
  determineCITRate(companySize, preferentialZone, hasInvestmentIncentives);
