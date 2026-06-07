export const VN_JURISDICTION = "vn" as const;
export const VN_CURRENCY_CODE = "VND" as const;
export const VN_LOCALE = "vi-VN" as const;
export const VN_MINIMUM_WAGE_2024 = 1_800_000;

export const VNVATRate = {
  REDUCED: 5,
  SPECIAL: 8,
  STANDARD: 10,
  ZERO: 0,
} as const;

export type VNVATRate = (typeof VNVATRate)[keyof typeof VNVATRate];

export const VNTaxDeclarationPeriod = {
  ANNUAL: "ANNUAL",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
} as const;

export type VNTaxDeclarationPeriod =
  (typeof VNTaxDeclarationPeriod)[keyof typeof VNTaxDeclarationPeriod];

export const VNEInvoiceProvider = {
  BKAV: "BKAV",
  FPT: "FPT",
  VIETTEL: "VIETTEL",
  VNPT: "VNPT",
} as const;

export type VNEInvoiceProvider =
  (typeof VNEInvoiceProvider)[keyof typeof VNEInvoiceProvider];

export const VNInsuranceType = {
  BHTN: "BHTN",
  BHXH: "BHXH",
  BHYT: "BHYT",
} as const;

export type VNInsuranceType =
  (typeof VNInsuranceType)[keyof typeof VNInsuranceType];

export const VNBankCode = {
  ACB: "ACB",
  BAB: "BAB",
  BIDV: "BIDV",
  BVB: "BVB",
  CTG: "CTG",
  EXB: "EXB",
  HDB: "HDB",
  MBB: "MBB",
  MB: "MB",
  NAB: "NAB",
  OCB: "OCB",
  PGB: "PGB",
  SHB: "SHB",
  STB: "STB",
  TCB: "TCB",
  TPB: "TPB",
  VCB: "VCB",
  VIB: "VIB",
  VPB: "VPB",
  VRB: "VRB",
} as const;

export type VNBankCode = (typeof VNBankCode)[keyof typeof VNBankCode];

export const VNCompanySize = {
  LARGE: "LARGE",
  MEDIUM: "MEDIUM",
  MICRO: "MICRO",
  SMALL: "SMALL",
  STARTUP: "STARTUP",
} as const;

export type VNCompanySize = (typeof VNCompanySize)[keyof typeof VNCompanySize];

export const VNPreferentialTaxZone = {
  EXPORT_ZONE: "EXPORT_ZONE",
  EXTREME_DIFFICULTY: "EXTREME_DIFFICULTY",
  FREE_TRADE_ZONE: "FREE_TRADE_ZONE",
  HIGHLAND: "HIGHLAND",
  TECH_PARK: "TECH_PARK",
} as const;

export type VNPreferentialTaxZone =
  (typeof VNPreferentialTaxZone)[keyof typeof VNPreferentialTaxZone];

export const VNEInvoiceStatus = {
  CANCELLED: "CANCELLED",
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  REJECTED: "REJECTED",
  REPLACED: "REPLACED",
} as const;

export type VNEInvoiceStatus =
  (typeof VNEInvoiceStatus)[keyof typeof VNEInvoiceStatus];

export const VNPaymentMethod = {
  CASH: "01",
  CHECK: "03",
  CREDIT_CARD: "04",
  E_WALLET: "05",
  OTHER: "99",
  TRANSFER: "02",
} as const;

export type VNPaymentMethod =
  (typeof VNPaymentMethod)[keyof typeof VNPaymentMethod];

export type VNPITBracket = {
  deductionAmount: number;
  fromIncome: number;
  rate: number;
  toIncome: number;
};

export type VNBankInfo = {
  bin: string;
  code: VNBankCode;
  englishName: string;
  name: string;
  swiftCode: string;
};

export type VNEInvoiceParty = {
  accountNumber?: string;
  address: string;
  bankName?: string;
  email?: string;
  name: string;
  phone?: string;
  swiftCode?: string;
  taxCode?: string;
};

export type VNEInvoiceItem = {
  amount: number;
  description: string;
  discount?: number;
  discountPercentage?: number;
  itemCode?: string;
  quantity: number;
  totalAmount: number;
  unit: string;
  unitPrice: number;
  vatAmount: number;
  vatRate: VNVATRate;
};

export type VNEInvoice = {
  buyer: VNEInvoiceParty;
  currencyCode: string;
  date: Date;
  dueDate?: Date;
  id?: string;
  invoiceNumber: string;
  items: VNEInvoiceItem[];
  notes?: string;
  paymentMethod: VNPaymentMethod;
  provider?: VNEInvoiceProvider;
  seller: VNEInvoiceParty;
  series: string;
  signature?: string;
  status: VNEInvoiceStatus;
  totalAfterVAT: number;
  totalBeforeVAT: number;
  totalDiscount?: number;
  totalVAT: number;
};

export type VNEInvoiceValidationResult = {
  errors: string[];
  valid: boolean;
  warnings: string[];
};

export type VNEInvoiceTransmission = {
  errorMessage?: string;
  invoiceId: string;
  provider: VNEInvoiceProvider;
  referenceNumber?: string;
  status: VNEInvoiceStatus;
  transmissionTime: Date;
};

export type VNEInvoiceStatusResponse = {
  details?: {
    cancelledDate?: Date;
    issuedDate?: Date;
    rejectionReason?: string;
    replacedDate?: Date;
  };
  invoiceId: string;
  invoiceNumber: string;
  lastUpdated: Date;
  provider: VNEInvoiceProvider;
  status: VNEInvoiceStatus;
};

export type VNEInvoiceProviderContract = {
  cancel: (payload: {
    invoiceId: string;
    invoiceNumber: string;
    reason: string;
    requestDate: Date;
    requestedBy: string;
    series: string;
  }) => Promise<VNEInvoiceTransmission>;
  getStatus: (invoiceId: string) => Promise<VNEInvoiceStatusResponse>;
  issue: (invoice: VNEInvoice) => Promise<VNEInvoiceTransmission>;
};

export type VNInsuranceRecord = {
  bhxhAmount: number;
  bhytAmount: number;
  bhtnAmount: number;
  employeeId: string;
  employeeName: string;
  salary: number;
  totalInsuranceAmount: number;
};

export type VNInsuranceReport = {
  companyName: string;
  employees: VNInsuranceRecord[];
  reportDate: Date;
  reportPeriod: string;
  taxCode: string;
  totalBHTN: number;
  totalBHXH: number;
  totalBHYT: number;
  totalInsurance: number;
  totalSalary: number;
};

export type VNVietQRCode = {
  accountNumber: string;
  amount?: number;
  bankCode: VNBankCode;
  description?: string;
  expiryDate: Date;
  qrString: string;
};

export type VNVietQRParsed = {
  accountNumber: string;
  amount?: number;
  bankCode: VNBankCode | "";
  valid: boolean;
};
