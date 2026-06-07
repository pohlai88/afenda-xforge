const CURRENCY_SYMBOL = "\u20ab";
const DECIMAL_SEPARATOR = ",";
const THOUSANDS_SEPARATOR = ".";

const ONES = [
  "",
  "mot",
  "hai",
  "ba",
  "bon",
  "nam",
  "sau",
  "bay",
  "tam",
  "chin",
];

const TENS = [
  "",
  "muoi",
  "hai muoi",
  "ba muoi",
  "bon muoi",
  "nam muoi",
  "sau muoi",
  "bay muoi",
  "tam muoi",
  "chin muoi",
];

const SCALE = ["", "nghin", "trieu", "ty", "nghin ty", "trieu ty"];

export const formatVND = (amount: number): string => {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }

  const roundedAmount = Math.round(amount);
  const formatted = roundedAmount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);

  return `${formatted} ${CURRENCY_SYMBOL}`;
};

export const formatVNDWithDecimals = (amount: number, decimals = 0): string => {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }

  if (decimals < 0 || decimals > 2) {
    throw new Error("Decimals must be between 0 and 2");
  }

  const fixed = amount.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split(".");
  const formatted = Number.parseInt(integerPart, 10)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);

  if (decimals === 0) {
    return `${formatted} ${CURRENCY_SYMBOL}`;
  }

  return `${formatted}${DECIMAL_SEPARATOR}${decimalPart} ${CURRENCY_SYMBOL}`;
};

const convertChunkToWords = (num: number): string => {
  if (num === 0) {
    return "";
  }

  const parts: string[] = [];
  const hundreds = Math.floor(num / 100);

  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} tram`);
  }

  const remainder = num % 100;

  if (remainder > 0) {
    if (remainder < 10) {
      parts.push(ONES[remainder]);
    } else if (remainder === 10) {
      parts.push("muoi");
    } else if (remainder < 20) {
      parts.push(`muoi ${ONES[remainder - 10]}`);
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      parts.push(TENS[tens]);
      if (ones > 0) {
        parts.push(ONES[ones]);
      }
    }
  }

  return parts.join(" ");
};

export const numberToWordsVN = (amount: number): string => {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Amount must be a non-negative integer");
  }

  if (amount === 0) {
    return "Khong dong";
  }

  const parts: string[] = [];
  let remaining = amount;
  let scale = 0;

  while (remaining > 0 && scale < SCALE.length) {
    const chunk = remaining % 1000;

    if (chunk !== 0) {
      const chunkWords = convertChunkToWords(chunk);
      parts.unshift(
        scale > 0 ? `${chunkWords} ${SCALE[scale]}`.trim() : chunkWords
      );
    }

    remaining = Math.floor(remaining / 1000);
    scale += 1;
  }

  const result = parts.join(" ").trim();
  return `${result.charAt(0).toUpperCase()}${result.slice(1)} dong`;
};

export const parseVND = (formatted: string): number => {
  if (!formatted || typeof formatted !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  let cleaned = formatted
    .replace(CURRENCY_SYMBOL, "")
    .replace(/\s/g, "")
    .trim();
  cleaned = cleaned.replace(new RegExp(`\\${THOUSANDS_SEPARATOR}`, "g"), "");
  cleaned = cleaned.replace(DECIMAL_SEPARATOR, ".");

  const parsed = Number.parseFloat(cleaned);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Invalid number format");
  }

  return Math.round(parsed);
};
