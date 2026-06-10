import type { PaginatedList } from "@repo/shared";
import { z } from "zod";

const emptyStringToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).max(maxLength).optional()
  );

const optionalUppercaseCode = (length: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .length(length)
      .transform((value) => value.toUpperCase())
      .optional()
  );

const optionalEmail = z.preprocess(
  emptyStringToUndefined,
  z
    .email()
    .max(320)
    .transform((value) => value.trim().toLowerCase())
    .optional()
);

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url().max(2048).optional()
);

export const companyStatusSchema = z.enum(["active", "inactive"]);

export const companyEstablishedOnSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
    .optional()
);

export const companySchema = z.object({
  code: z.string(),
  countryCode: z.string().optional(),
  currencyCode: z.string().optional(),
  description: z.string().optional(),
  email: z.email().optional(),
  establishedOn: companyEstablishedOnSchema,
  id: z.string(),
  isGroup: z.boolean(),
  name: z.string(),
  parentCompanyId: z.string().optional(),
  phone: z.string().optional(),
  registrationNumber: z.string().optional(),
  status: companyStatusSchema,
  taxId: z.string().optional(),
  website: z.string().optional(),
});

export const listCompaniesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    parentCompanyId: optionalTrimmedString(128),
    rootOnly: z.coerce.boolean().optional(),
    search: z.string().trim().min(1).optional(),
    status: companyStatusSchema.optional(),
  })
  .refine(
    (query) => !(query.rootOnly && query.parentCompanyId),
    "Use either rootOnly or parentCompanyId, not both"
  );

export const getCompanyQuerySchema = z.object({
  companyId: z.string().trim().min(1),
});

export const companyListSchema = z.object({
  items: z.array(companySchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

const companyLegalFieldsSchema = {
  countryCode: optionalUppercaseCode(2),
  currencyCode: optionalUppercaseCode(3),
  description: optionalTrimmedString(2000),
  email: optionalEmail,
  establishedOn: companyEstablishedOnSchema,
  isGroup: z.boolean().default(false),
  parentCompanyId: optionalTrimmedString(128),
  phone: optionalTrimmedString(64),
  registrationNumber: optionalTrimmedString(64),
  status: companyStatusSchema.default("active"),
  taxId: optionalTrimmedString(64),
  website: optionalUrl,
} as const;

export const createCompanyBodySchema = z.object({
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(120),
  ...companyLegalFieldsSchema,
});

export const updateCompanyBodySchema = z.object({
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(120),
  ...companyLegalFieldsSchema,
});

export const updateActiveCompanyBodySchema = updateCompanyBodySchema;

export const companyLifecycleBodySchema = z.object({
  companyId: z.string().trim().min(1),
});

export const companyHierarchyNodeSchema: z.ZodType<CompanyHierarchyNode> =
  companySchema.extend({
    children: z.array(z.lazy(() => companyHierarchyNodeSchema)),
  });

export const companyHierarchySchema = z.array(companyHierarchyNodeSchema);

export type Company = z.infer<typeof companySchema>;
export type CompanyHierarchyNode = Company & {
  children: CompanyHierarchyNode[];
};
export type CompanyList = PaginatedList<Company>;
export type CompanyLifecycleBody = z.infer<typeof companyLifecycleBodySchema>;
export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;
export type GetCompanyQuery = z.infer<typeof getCompanyQuerySchema>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;
export type UpdateActiveCompanyBody = z.infer<
  typeof updateActiveCompanyBodySchema
>;
export type UpdateCompanyBody = z.infer<typeof updateCompanyBodySchema>;
