import type { VNInsuranceRecord, VNInsuranceReport } from "../types.ts";
import { VN_MINIMUM_WAGE_2024 } from "../types.ts";

const INSURANCE_RATES = {
  bhtn: { employee: 0.01, employer: 0.01 },
  bhxh: { employee: 0.08, employer: 0.175 },
  bhyt: { employee: 0.015, employer: 0.03 },
} as const;

const SALARY_CAP: number = VN_MINIMUM_WAGE_2024 * 20;

type VNInsuranceCalculation = {
  bhtnEmployee: number;
  bhtnEmployer: number;
  bhxhEmployee: number;
  bhxhEmployer: number;
  bhytEmployee: number;
  bhytEmployer: number;
  cappedSalary: number;
  salary: number;
  totalEmployee: number;
  totalEmployer: number;
  totalInsurance: number;
};

type VNNetSalaryAfterInsurance = {
  grossSalary: number;
  insuranceDeduction: number;
  netSalary: number;
};

const capSalary = (salary: number): number => Math.min(salary, SALARY_CAP);

export const getVNInsuranceSalaryCap = (): number => SALARY_CAP;

export const calculateVNBHXH = (salary: number, employeeOnly = false): number =>
  Math.round(
    capSalary(salary) *
      (employeeOnly
        ? INSURANCE_RATES.bhxh.employee
        : INSURANCE_RATES.bhxh.employer)
  );

export const calculateVNBHYT = (salary: number, employeeOnly = false): number =>
  Math.round(
    capSalary(salary) *
      (employeeOnly
        ? INSURANCE_RATES.bhyt.employee
        : INSURANCE_RATES.bhyt.employer)
  );

export const calculateVNBHTN = (salary: number, employeeOnly = false): number =>
  Math.round(
    capSalary(salary) *
      (employeeOnly
        ? INSURANCE_RATES.bhtn.employee
        : INSURANCE_RATES.bhtn.employer)
  );

export const calculateVNTotalInsurance = (
  salary: number
): VNInsuranceCalculation => {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  const cappedSalary = capSalary(salary);
  const bhxhEmployee = calculateVNBHXH(salary, true);
  const bhxhEmployer = calculateVNBHXH(salary, false);
  const bhytEmployee = calculateVNBHYT(salary, true);
  const bhytEmployer = calculateVNBHYT(salary, false);
  const bhtnEmployee = calculateVNBHTN(salary, true);
  const bhtnEmployer = calculateVNBHTN(salary, false);
  const totalEmployee = bhxhEmployee + bhytEmployee + bhtnEmployee;
  const totalEmployer = bhxhEmployer + bhytEmployer + bhtnEmployer;

  return {
    bhxhEmployee,
    bhxhEmployer,
    bhytEmployee,
    bhytEmployer,
    bhtnEmployee,
    bhtnEmployer,
    cappedSalary,
    salary,
    totalEmployee,
    totalEmployer,
    totalInsurance: totalEmployee + totalEmployer,
  };
};

export const calculateVNNetSalaryAfterInsurance = (
  salary: number
): VNNetSalaryAfterInsurance => {
  const calculation = calculateVNTotalInsurance(salary);
  return {
    grossSalary: salary,
    insuranceDeduction: calculation.totalEmployee,
    netSalary: Math.max(0, salary - calculation.totalEmployee),
  };
};

export const generateVNInsuranceReport = (
  companyName: string,
  taxCode: string,
  employees: readonly VNInsuranceRecord[],
  reportDate = new Date()
): VNInsuranceReport => {
  const reportPeriod = `${reportDate.getFullYear()}-${`${reportDate.getMonth() + 1}`.padStart(2, "0")}`;

  return {
    companyName,
    employees: [...employees],
    reportDate,
    reportPeriod,
    taxCode,
    totalBHTN: employees.reduce(
      (sum, employee) => sum + employee.bhtnAmount,
      0
    ),
    totalBHXH: employees.reduce(
      (sum, employee) => sum + employee.bhxhAmount,
      0
    ),
    totalBHYT: employees.reduce(
      (sum, employee) => sum + employee.bhytAmount,
      0
    ),
    totalInsurance: employees.reduce(
      (sum, employee) => sum + employee.totalInsuranceAmount,
      0
    ),
    totalSalary: employees.reduce((sum, employee) => sum + employee.salary, 0),
  };
};
