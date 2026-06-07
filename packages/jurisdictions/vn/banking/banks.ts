import type { VNBankInfo } from "../types.ts";
import { VNBankCode } from "../types.ts";

const VIETNAMESE_BANKS: Record<VNBankCode, VNBankInfo> = {
  VCB: {
    code: VNBankCode.VCB,
    name: "Ngan hang Ngoai thuong Viet Nam",
    englishName: "Vietcombank",
    swiftCode: "BFTVVNVX",
    bin: "970436",
  },
  BIDV: {
    code: VNBankCode.BIDV,
    name: "Ngan hang Dau tu va Phat trien Viet Nam",
    englishName: "Bank for Investment and Development of Vietnam",
    swiftCode: "BIDVVNVX",
    bin: "970418",
  },
  TCB: {
    code: VNBankCode.TCB,
    name: "Ngan hang Ky thuong Viet Nam",
    englishName: "Techcombank",
    swiftCode: "TECHVNVX",
    bin: "970407",
  },
  MB: {
    code: VNBankCode.MB,
    name: "Ngan hang Quan doi",
    englishName: "MB Bank",
    swiftCode: "MSCBVNVX",
    bin: "970422",
  },
  VPB: {
    code: VNBankCode.VPB,
    name: "Ngan hang VPBank",
    englishName: "VPBank",
    swiftCode: "VPBKVNVX",
    bin: "970432",
  },
  ACB: {
    code: VNBankCode.ACB,
    name: "Ngan hang A Chau",
    englishName: "Asia Commercial Bank",
    swiftCode: "ASCBVNVX",
    bin: "970425",
  },
  SHB: {
    code: VNBankCode.SHB,
    name: "Ngan hang SHB",
    englishName: "SHB",
    swiftCode: "SHBKVNVX",
    bin: "970443",
  },
  TPB: {
    code: VNBankCode.TPB,
    name: "Ngan hang TPBank",
    englishName: "TPBank",
    swiftCode: "TPBKVNVX",
    bin: "970423",
  },
  HDB: {
    code: VNBankCode.HDB,
    name: "Ngan hang HDBank",
    englishName: "HDBank",
    swiftCode: "HDBKVNVX",
    bin: "970437",
  },
  STB: {
    code: VNBankCode.STB,
    name: "Ngan hang Sacombank",
    englishName: "Sacombank",
    swiftCode: "SACOMVN",
    bin: "970424",
  },
  EXB: {
    code: VNBankCode.EXB,
    name: "Ngan hang Xuat nhap khau Viet Nam",
    englishName: "Exim Bank",
    swiftCode: "EXIMBVN",
    bin: "970419",
  },
  MBB: {
    code: VNBankCode.MBB,
    name: "Ngan hang Quan doi",
    englishName: "Military Commercial Bank",
    swiftCode: "MCBKVNVX",
    bin: "970426",
  },
  VIB: {
    code: VNBankCode.VIB,
    name: "Ngan hang VIB",
    englishName: "Vietnam International Bank",
    swiftCode: "VIBKVNVX",
    bin: "970441",
  },
  CTG: {
    code: VNBankCode.CTG,
    name: "Ngan hang SeABank",
    englishName: "Southeast Asia Bank",
    swiftCode: "CTGDVNVX",
    bin: "970412",
  },
  OCB: {
    code: VNBankCode.OCB,
    name: "Ngan hang Phuong Dong",
    englishName: "Orient Commercial Bank",
    swiftCode: "ORCBVNVX",
    bin: "970448",
  },
  VRB: {
    code: VNBankCode.VRB,
    name: "Ngan hang VRB",
    englishName: "Vietnam Rubber Bank",
    swiftCode: "VRBBVNVX",
    bin: "970456",
  },
  NAB: {
    code: VNBankCode.NAB,
    name: "Ngan hang Nam A",
    englishName: "Nam A Bank",
    swiftCode: "NAMAVNVX",
    bin: "970452",
  },
  BVB: {
    code: VNBankCode.BVB,
    name: "Ngan hang BVBANK",
    englishName: "BVBANK",
    swiftCode: "BVBKVNVX",
    bin: "970450",
  },
  PGB: {
    code: VNBankCode.PGB,
    name: "Ngan hang PGB",
    englishName: "PGB",
    swiftCode: "PGBKVNVX",
    bin: "970445",
  },
  BAB: {
    code: VNBankCode.BAB,
    name: "Ngan hang Bac A",
    englishName: "Bac A Bank",
    swiftCode: "NASCVNVX",
    bin: "970409",
  },
};

export const getVNBankByCode = (code: VNBankCode): VNBankInfo | null =>
  VIETNAMESE_BANKS[code] ?? null;

export const listVNBanks = (): VNBankInfo[] => Object.values(VIETNAMESE_BANKS);

export const searchVNBankByName = (name: string): VNBankInfo[] => {
  const searchTerm = name.toLowerCase();
  return listVNBanks().filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm) ||
      bank.englishName.toLowerCase().includes(searchTerm)
  );
};

export const getVNBankByBIN = (bin: string): VNBankInfo | null =>
  listVNBanks().find((bank) => bank.bin === bin) ?? null;

export const isVNBankCode = (code: string): code is VNBankCode =>
  code in VIETNAMESE_BANKS;
