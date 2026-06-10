import type { Company } from "./schema.ts";

export type CompanyRecordRow = {
  code: string;
  countryCode: string | null;
  currencyCode: string | null;
  description: string | null;
  email: string | null;
  establishedOn: Date | null;
  id: string;
  isGroup: boolean;
  name: string;
  parentCompanyId: string | null;
  phone: string | null;
  registrationNumber: string | null;
  status: string;
  taxId: string | null;
  website: string | null;
};

const dateToIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

export const mapCompany = (row: CompanyRecordRow): Company => ({
  code: row.code,
  ...(row.countryCode ? { countryCode: row.countryCode } : {}),
  ...(row.currencyCode ? { currencyCode: row.currencyCode } : {}),
  ...(row.description ? { description: row.description } : {}),
  ...(row.email ? { email: row.email } : {}),
  ...(row.establishedOn
    ? { establishedOn: dateToIsoDate(row.establishedOn) }
    : {}),
  id: row.id,
  isGroup: row.isGroup,
  name: row.name,
  ...(row.parentCompanyId ? { parentCompanyId: row.parentCompanyId } : {}),
  ...(row.phone ? { phone: row.phone } : {}),
  ...(row.registrationNumber
    ? { registrationNumber: row.registrationNumber }
    : {}),
  status: row.status === "inactive" ? "inactive" : "active",
  ...(row.taxId ? { taxId: row.taxId } : {}),
  ...(row.website ? { website: row.website } : {}),
});
