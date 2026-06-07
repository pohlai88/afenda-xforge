import type { VNBankCode, VNVietQRCode, VNVietQRParsed } from "../types.ts";
import { getVNBankByBIN, getVNBankByCode } from "./banks.ts";

const VIET_QR_PREFIX = "00020126";

const generateQRString = (payload: {
  bankCode: string;
  accountNumber: string;
  amount: string;
  description: string;
}): string => {
  let value = `${VIET_QR_PREFIX}360005`;
  value += payload.bankCode;
  value += payload.accountNumber;
  value += payload.amount;
  if (payload.description) {
    value += payload.description;
  }
  return value;
};

export const generateVietQR = (
  bankCode: VNBankCode,
  accountNumber: string,
  amount?: number,
  description?: string
): string => {
  if (!(bankCode && accountNumber)) {
    throw new Error("Bank code and account number are required");
  }

  if (amount !== undefined && amount < 0) {
    throw new Error("Amount must be non-negative");
  }

  const bank = getVNBankByCode(bankCode);
  if (!bank) {
    throw new Error(`Unknown bank code: ${bankCode}`);
  }

  return generateQRString({
    accountNumber: accountNumber.padStart(20, "0"),
    amount: amount ? `${amount}`.padStart(13, "0") : "0000000000000",
    bankCode: bank.bin,
    description: description ? encodeURIComponent(description) : "",
  });
};

export const parseVietQR = (qrString: string): VNVietQRParsed => {
  if (!qrString || qrString.length < 50) {
    return { accountNumber: "", bankCode: "", valid: false };
  }

  try {
    const bin = qrString.slice(8, 14);
    const accountNumber = qrString.slice(14, 34).replace(/^0+/u, "");
    const amountSegment = qrString.slice(34, 47);
    const bank = getVNBankByBIN(bin);

    return {
      accountNumber,
      amount:
        amountSegment === "0000000000000"
          ? undefined
          : Number.parseInt(amountSegment, 10),
      bankCode: bank?.code ?? "",
      valid: Boolean(bank),
    };
  } catch {
    return { accountNumber: "", bankCode: "", valid: false };
  }
};

export const createVietQRCode = (
  bankCode: VNBankCode,
  accountNumber: string,
  amount?: number,
  description?: string
): VNVietQRCode => ({
  accountNumber,
  amount,
  bankCode,
  description,
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  qrString: generateVietQR(bankCode, accountNumber, amount, description),
});

export const validateVietQR = (
  qrString: string
): { valid: boolean; message?: string } => {
  if (!qrString) {
    return { valid: false, message: "QR string is required" };
  }

  if (!qrString.startsWith(VIET_QR_PREFIX)) {
    return { valid: false, message: "Invalid QR prefix" };
  }

  const parsed = parseVietQR(qrString);
  return parsed.valid
    ? { valid: true }
    : { valid: false, message: "Invalid QR data" };
};
