import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const xforge = pgSchema("xforge");

export const tenants = xforge.table(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("tenants_slug_unique").on(table.slug)]
);

export const companies = xforge.table(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: varchar("code", { length: 64 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    parentCompanyId: uuid("parent_company_id"),
    isGroup: boolean("is_group").notNull().default(false),
    countryCode: varchar("country_code", { length: 2 }),
    currencyCode: varchar("currency_code", { length: 3 }),
    taxId: varchar("tax_id", { length: 64 }),
    registrationNumber: varchar("registration_number", { length: 64 }),
    email: text("email"),
    phone: varchar("phone", { length: 64 }),
    website: text("website"),
    description: text("description"),
    establishedOn: timestamp("established_on", {
      mode: "date",
      withTimezone: true,
    }),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    deletedAt: timestamp("deleted_at", {
      mode: "date",
      withTimezone: true,
    }),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentCompanyId],
      foreignColumns: [table.id],
      name: "companies_parent_company_id_companies_id_fk",
    }).onDelete("set null"),
    index("companies_tenant_id_idx").on(table.tenantId),
    index("companies_tenant_status_idx").on(table.tenantId, table.status),
    index("companies_tenant_parent_idx").on(
      table.tenantId,
      table.parentCompanyId
    ),
    index("companies_tenant_name_idx").on(table.tenantId, table.name),
    uniqueIndex("companies_tenant_code_unique").on(table.tenantId, table.code),
  ]
);

export const customers = xforge.table(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 32 }).notNull(),
    email: text("email"),
    name: text("name").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("customers_tenant_id_idx").on(table.tenantId),
    index("customers_tenant_status_idx").on(table.tenantId, table.status),
    uniqueIndex("customers_tenant_code_unique").on(table.tenantId, table.code),
  ]
);

export const tenantMemberships = xforge.table(
  "tenant_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: varchar("role", { length: 32 }).notNull().default("member"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tenant_memberships_tenant_id_idx").on(table.tenantId),
    uniqueIndex("tenant_memberships_tenant_user_unique").on(
      table.tenantId,
      table.userId
    ),
  ]
);

export const companyGrants = xforge.table(
  "company_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    grant: varchar("grant", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("company_grants_tenant_id_idx").on(table.tenantId),
    index("company_grants_company_id_idx").on(table.companyId),
    uniqueIndex("company_grants_unique").on(
      table.tenantId,
      table.companyId,
      table.userId,
      table.grant
    ),
  ]
);

export const notificationInbox = xforge.table(
  "notification_inbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    notificationId: uuid("notification_id").notNull(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    userId: text("user_id").notNull(),
    event: varchar("event", { length: 128 }).notNull(),
    topic: text("topic").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    dispatchedAt: timestamp("dispatched_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    seenAt: timestamp("seen_at", {
      mode: "date",
      withTimezone: true,
    }),
    readAt: timestamp("read_at", {
      mode: "date",
      withTimezone: true,
    }),
    archivedAt: timestamp("archived_at", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notification_inbox_notification_id_idx").on(table.notificationId),
    index("notification_inbox_tenant_user_dispatched_idx").on(
      table.tenantId,
      table.userId,
      table.dispatchedAt
    ),
    index("notification_inbox_tenant_company_user_dispatched_idx").on(
      table.tenantId,
      table.companyId,
      table.userId,
      table.dispatchedAt
    ),
  ]
);

export const webhookEndpoints = xforge.table(
  "webhook_endpoints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    provider: varchar("provider", { length: 64 }).notNull(),
    endpointId: varchar("endpoint_id", { length: 128 }).notNull(),
    applicationId: text("application_id"),
    applicationName: text("application_name"),
    eventOwner: varchar("event_owner", { length: 128 }).notNull(),
    schemaVersion: varchar("schema_version", { length: 32 }).notNull(),
    secret: text("secret").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("webhook_endpoints_tenant_id_idx").on(table.tenantId),
    index("webhook_endpoints_tenant_provider_status_idx").on(
      table.tenantId,
      table.provider,
      table.status
    ),
    uniqueIndex("webhook_endpoints_provider_endpoint_unique").on(
      table.provider,
      table.endpointId
    ),
  ]
);

export const complianceObligations = xforge.table(
  "compliance_obligations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    code: varchar("code", { length: 96 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    requirementKind: varchar("requirement_kind", { length: 64 }).notNull(),
    severity: varchar("severity", { length: 32 }).notNull(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull(),
    expectedEvidenceType: varchar("expected_evidence_type", {
      length: 96,
    }).notNull(),
    initialDueInDays: integer("initial_due_in_days"),
    renewalEveryDays: integer("renewal_every_days"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    active: boolean("active").notNull().default(true),
    jurisdictionSource: text("jurisdiction_source").notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    ownerTeam: text("owner_team"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_obligations_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("compliance_obligations_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
  ]
);

export const complianceWorkerProfiles = xforge.table(
  "compliance_worker_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    employeeNumber: varchar("employee_number", { length: 96 }).notNull(),
    displayName: text("display_name").notNull(),
    legalEntityCode: varchar("legal_entity_code", { length: 96 }),
    countryCode: varchar("country_code", { length: 8 }),
    workLocationCode: varchar("work_location_code", { length: 96 }),
    employmentType: varchar("employment_type", { length: 96 }),
    workerCategory: varchar("worker_category", { length: 96 }),
    departmentId: text("department_id"),
    hireDate: timestamp("hire_date", { mode: "date", withTimezone: true }),
    terminationDate: timestamp("termination_date", {
      mode: "date",
      withTimezone: true,
    }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_worker_profiles_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("compliance_worker_profiles_tenant_employee_unique").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
  ]
);

export const employeeUserAccounts = xforge.table(
  "employee_user_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    employeeId: text("employee_id").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("employee_user_accounts_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("employee_user_accounts_tenant_company_user_unique").on(
      table.tenantId,
      table.companyId,
      table.userId
    ),
    uniqueIndex("employee_user_accounts_tenant_company_employee_unique").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
  ]
);

export const employeeRecordAssignmentHistory = xforge.table(
  "employee_record_assignment_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    departmentId: text("department_id"),
    positionId: text("position_id"),
    workLocationCode: varchar("work_location_code", { length: 96 }),
    managerEmployeeId: text("manager_employee_id"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    source: varchar("source", { length: 64 }).notNull(),
    reason: text("reason"),
    actorId: text("actor_id"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("employee_record_assignment_history_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index(
      "employee_record_assignment_history_tenant_company_department_idx"
    ).on(table.tenantId, table.companyId, table.departmentId),
    index("employee_record_assignment_history_tenant_company_manager_idx").on(
      table.tenantId,
      table.companyId,
      table.managerEmployeeId
    ),
    index("employee_record_assignment_history_tenant_company_location_idx").on(
      table.tenantId,
      table.companyId,
      table.workLocationCode
    ),
    index("employee_record_assignment_history_tenant_company_effective_idx").on(
      table.tenantId,
      table.companyId,
      table.effectiveFrom
    ),
  ]
);

export const employeeRecordStatusHistory = xforge.table(
  "employee_record_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    previousStatus: varchar("previous_status", { length: 16 }),
    effectiveAt: timestamp("effective_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    source: varchar("source", { length: 64 }).notNull(),
    reason: text("reason"),
    actorId: text("actor_id"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("employee_record_status_history_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("employee_record_status_history_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("employee_record_status_history_tenant_company_effective_idx").on(
      table.tenantId,
      table.companyId,
      table.effectiveAt
    ),
    index("employee_record_status_history_tenant_company_source_idx").on(
      table.tenantId,
      table.companyId,
      table.source
    ),
  ]
);

export const hrOffboardingCases = xforge.table(
  "hr_offboarding_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    caseNumber: varchar("case_number", { length: 96 }).notNull(),
    caseTitle: text("case_title").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    exitType: varchar("exit_type", { length: 64 }).notNull(),
    lifecycleSourceFeatureId: varchar("lifecycle_source_feature_id", {
      length: 160,
    }).notNull(),
    lifecycleSourceEventId: text("lifecycle_source_event_id").notNull(),
    lifecycleTriggerSnapshot: jsonb("lifecycle_trigger_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    effectiveSeparationDate: timestamp("effective_separation_date", {
      mode: "date",
      withTimezone: true,
    }),
    lastWorkingDate: timestamp("last_working_date", {
      mode: "date",
      withTimezone: true,
    }),
    noticeStartDate: timestamp("notice_start_date", {
      mode: "date",
      withTimezone: true,
    }),
    noticeEndDate: timestamp("notice_end_date", {
      mode: "date",
      withTimezone: true,
    }),
    coordinatorActorId: text("coordinator_actor_id"),
    requestedByActorId: text("requested_by_actor_id"),
    reasonSummary: text("reason_summary"),
    rehireEligibility: varchar("rehire_eligibility", { length: 32 }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("hr_offboarding_cases_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_offboarding_cases_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("hr_offboarding_cases_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("hr_offboarding_cases_tenant_company_exit_type_idx").on(
      table.tenantId,
      table.companyId,
      table.exitType
    ),
    index("hr_offboarding_cases_tenant_company_last_working_idx").on(
      table.tenantId,
      table.companyId,
      table.lastWorkingDate
    ),
    uniqueIndex("hr_offboarding_cases_tenant_company_case_number_unique").on(
      table.tenantId,
      table.companyId,
      table.caseNumber
    ),
    uniqueIndex(
      "hr_offboarding_cases_tenant_company_lifecycle_event_unique"
    ).on(table.tenantId, table.companyId, table.lifecycleSourceEventId),
  ]
);

export const lamAttendanceRecords = xforge.table(
  "lam_attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    attendanceDate: date("attendance_date", { mode: "date" }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    workCalendarId: text("work_calendar_id"),
    clockInAt: timestamp("clock_in_at", {
      mode: "date",
      withTimezone: true,
    }),
    clockOutAt: timestamp("clock_out_at", {
      mode: "date",
      withTimezone: true,
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_attendance_records_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("lam_attendance_records_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    uniqueIndex(
      "lam_attendance_records_tenant_company_employee_date_unique"
    ).on(
      table.tenantId,
      table.companyId,
      table.employeeId,
      table.attendanceDate
    ),
  ]
);

export const lamAttendanceCorrections = xforge.table(
  "lam_attendance_corrections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    attendanceRecordId: uuid("attendance_record_id")
      .notNull()
      .references(() => lamAttendanceRecords.id, { onDelete: "cascade" }),
    exceptionType: varchar("exception_type", { length: 32 }).notNull(),
    requestedStatus: varchar("requested_status", { length: 32 }).notNull(),
    requestedClockInAt: timestamp("requested_clock_in_at", {
      mode: "date",
      withTimezone: true,
    }),
    requestedClockOutAt: timestamp("requested_clock_out_at", {
      mode: "date",
      withTimezone: true,
    }),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    approvalRouteId: uuid("approval_route_id").references(
      () => lamLeaveApprovalRoutes.id,
      { onDelete: "set null" }
    ),
    currentStepOrder: integer("current_step_order"),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", {
      mode: "date",
      withTimezone: true,
    }),
    rejectionReason: text("rejection_reason"),
    submittedAt: timestamp("submitted_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_attendance_corrections_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("lam_attendance_corrections_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("lam_attendance_corrections_record_exception_idx").on(
      table.attendanceRecordId,
      table.exceptionType
    ),
  ]
);

export const lamCompanyAttendanceSettings = xforge.table(
  "lam_company_attendance_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    attendanceCorrectionsEnabled: boolean("attendance_corrections_enabled")
      .notNull()
      .default(true),
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("lam_company_attendance_settings_tenant_company_unique").on(
      table.tenantId,
      table.companyId
    ),
  ]
);

export const lamLeaveTypes = xforge.table(
  "lam_leave_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    code: varchar("code", { length: 64 }).notNull(),
    name: text("name").notNull(),
    kind: varchar("kind", { length: 64 }).notNull(),
    policyGroupId: text("policy_group_id"),
    active: boolean("active").notNull().default(true),
    requiresDocument: boolean("requires_document").notNull().default(false),
    paid: boolean("paid").notNull().default(true),
    minNoticeDays: integer("min_notice_days"),
    maxConsecutiveDays: integer("max_consecutive_days"),
    eligibilityTenureMonthsMin: integer("eligibility_tenure_months_min"),
    eligibilityGender: varchar("eligibility_gender", { length: 16 }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_types_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("lam_leave_types_tenant_company_policy_group_idx").on(
      table.tenantId,
      table.companyId,
      table.policyGroupId
    ),
    uniqueIndex("lam_leave_types_tenant_company_code_policy_group_unique").on(
      table.tenantId,
      table.companyId,
      table.code,
      table.policyGroupId
    ),
  ]
);

export const lamLeaveEntitlementRules = xforge.table(
  "lam_leave_entitlement_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    leaveTypeId: text("leave_type_id").notNull(),
    code: varchar("code", { length: 64 }).notNull(),
    title: text("title").notNull(),
    scope: jsonb("scope").$type<Record<string, unknown>>(),
    entitlementDays: integer("entitlement_days").notNull(),
    accrualRule: text("accrual_rule"),
    tenureMonthsMin: integer("tenure_months_min"),
    tenureMonthsMax: integer("tenure_months_max"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_entitlement_rules_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("lam_leave_entitlement_rules_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
    index("lam_leave_entitlement_rules_leave_type_idx").on(table.leaveTypeId),
  ]
);

export const lamLeaveCarryForwardRules = xforge.table(
  "lam_leave_carry_forward_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    leaveTypeId: text("leave_type_id").notNull(),
    code: varchar("code", { length: 64 }).notNull(),
    title: text("title").notNull(),
    scope: jsonb("scope").$type<Record<string, unknown>>(),
    maxCarryForwardDays: integer("max_carry_forward_days").notNull(),
    forfeitUnused: boolean("forfeit_unused").notNull().default(true),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_carry_forward_rules_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex(
      "lam_leave_carry_forward_rules_tenant_company_code_unique"
    ).on(table.tenantId, table.companyId, table.code),
    index("lam_leave_carry_forward_rules_leave_type_idx").on(
      table.leaveTypeId
    ),
  ]
);

export const lamLeaveBlackoutPeriods = xforge.table(
  "lam_leave_blackout_periods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    leaveTypeId: text("leave_type_id"),
    code: varchar("code", { length: 64 }).notNull(),
    title: text("title").notNull(),
    scope: jsonb("scope").$type<Record<string, unknown>>(),
    startDate: timestamp("start_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    endDate: timestamp("end_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    reason: text("reason").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_blackout_periods_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("lam_leave_blackout_periods_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
    index("lam_leave_blackout_periods_leave_type_idx").on(table.leaveTypeId),
  ]
);

export const lamLeaveApprovalRoutes = xforge.table(
  "lam_leave_approval_routes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    code: varchar("code", { length: 64 }).notNull(),
    title: text("title").notNull(),
    leaveTypeId: text("leave_type_id"),
    scope: jsonb("scope").$type<Record<string, unknown>>(),
    minDurationDays: integer("min_duration_days"),
    maxDurationDays: integer("max_duration_days"),
    steps: jsonb("steps").$type<Record<string, unknown>[]>().notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_approval_routes_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("lam_leave_approval_routes_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
    index("lam_leave_approval_routes_leave_type_idx").on(table.leaveTypeId),
  ]
);

export const lamLeaveBalances = xforge.table(
  "lam_leave_balances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    leaveTypeId: text("leave_type_id").notNull(),
    periodYear: integer("period_year").notNull(),
    openingBalance: integer("opening_balance").notNull().default(0),
    earned: integer("earned").notNull().default(0),
    used: integer("used").notNull().default(0),
    pending: integer("pending").notNull().default(0),
    adjusted: integer("adjusted").notNull().default(0),
    forfeited: integer("forfeited").notNull().default(0),
    carriedForward: integer("carried_forward").notNull().default(0),
    remaining: integer("remaining").notNull().default(0),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_balances_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    uniqueIndex(
      "lam_leave_balances_tenant_company_employee_type_year_unique"
    ).on(
      table.tenantId,
      table.companyId,
      table.employeeId,
      table.leaveTypeId,
      table.periodYear
    ),
  ]
);

export const lamLeaveApplications = xforge.table(
  "lam_leave_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    leaveTypeId: text("leave_type_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    startDate: timestamp("start_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    endDate: timestamp("end_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    totalDays: integer("total_days").notNull(),
    reason: text("reason"),
    supportingDocumentId: text("supporting_document_id"),
    approvalRouteId: text("approval_route_id"),
    currentStepOrder: integer("current_step_order"),
    approvedBy: text("approved_by"),
    rejectionReason: text("rejection_reason"),
    returnedAt: timestamp("returned_at", {
      mode: "date",
      withTimezone: true,
    }),
    returnedReason: text("returned_reason"),
    cancellationReason: text("cancellation_reason"),
    submittedAt: timestamp("submitted_at", {
      mode: "date",
      withTimezone: true,
    }),
    approvedAt: timestamp("approved_at", {
      mode: "date",
      withTimezone: true,
    }),
    cancelledAt: timestamp("cancelled_at", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_applications_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("lam_leave_applications_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
  ]
);

export const lamLeaveDocuments = xforge.table(
  "lam_leave_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    storageKey: text("storage_key").notNull(),
    fileName: text("file_name").notNull(),
    contentType: varchar("content_type", { length: 128 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    referenceNumber: text("reference_number"),
    documentKind: varchar("document_kind", { length: 64 })
      .notNull()
      .default("supporting_document"),
    panelClinicId: text("panel_clinic_id"),
    panelClinicName: text("panel_clinic_name"),
    issuedAt: timestamp("issued_at", {
      mode: "date",
      withTimezone: true,
    }),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    hospitalizationAdmissionDate: timestamp("hospitalization_admission_date", {
      mode: "date",
      withTimezone: true,
    }),
    hospitalizationDischargeDate: timestamp("hospitalization_discharge_date", {
      mode: "date",
      withTimezone: true,
    }),
    sourceDocumentId: text("source_document_id"),
    leaveApplicationId: text("leave_application_id"),
    uploadedAt: timestamp("uploaded_at", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_leave_documents_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("lam_leave_documents_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("lam_leave_documents_leave_application_idx").on(
      table.leaveApplicationId
    ),
    index("lam_leave_documents_document_kind_idx").on(
      table.tenantId,
      table.companyId,
      table.documentKind
    ),
  ]
);

export const lamAuditReferences = xforge.table(
  "lam_audit_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    auditEventId: uuid("audit_event_id").references(() => auditEvents.id, {
      onDelete: "cascade",
    }),
    actorId: text("actor_id"),
    action: varchar("action", { length: 128 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary"),
    reason: text("reason"),
    before: jsonb("before").$type<Record<string, unknown>>(),
    after: jsonb("after").$type<Record<string, unknown>>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lam_audit_refs_tenant_entity_idx").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
    index("lam_audit_refs_tenant_action_idx").on(table.tenantId, table.action),
  ]
);

export const moduleConsoleOperatorAssignments = xforge.table(
  "module_console_operator_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    consoleId: varchar("console_id", { length: 64 }).notNull(),
    operatorUserId: text("operator_user_id").notNull(),
    assignedBy: text("assigned_by").notNull(),
    capabilities: jsonb("capabilities").$type<string[]>(),
    validFrom: timestamp("valid_from", {
      mode: "date",
      withTimezone: true,
    }),
    validTo: timestamp("valid_to", {
      mode: "date",
      withTimezone: true,
    }),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", {
      mode: "date",
      withTimezone: true,
    }),
  },
  (table) => [
    index("module_console_operator_assignments_tenant_console_idx").on(
      table.tenantId,
      table.consoleId,
      table.companyId
    ),
  ]
);

export const hrDelegationGrants = xforge.table(
  "hr_delegation_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    grantorId: text("grantor_id").notNull(),
    granteeId: text("grantee_id").notNull(),
    capabilities: jsonb("capabilities").$type<string[]>().notNull(),
    validFrom: timestamp("valid_from", {
      mode: "date",
      withTimezone: true,
    }),
    validTo: timestamp("valid_to", {
      mode: "date",
      withTimezone: true,
    }),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", {
      mode: "date",
      withTimezone: true,
    }),
  },
  (table) => [
    index("hr_delegation_grants_tenant_company_grantee_idx").on(
      table.tenantId,
      table.companyId,
      table.granteeId
    ),
  ]
);

export const complianceEvidenceArtifacts = xforge.table(
  "compliance_evidence_artifacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    obligationId: uuid("obligation_id").notNull(),
    requirementId: text("requirement_id"),
    evidenceType: varchar("evidence_type", { length: 96 }).notNull(),
    title: text("title").notNull(),
    sourceDocumentId: text("source_document_id"),
    sourceDocumentNumber: text("source_document_number"),
    sourceNotes: text("source_notes"),
    sensitivity: varchar("sensitivity", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    issuedAt: timestamp("issued_at", { mode: "date", withTimezone: true }),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
    verifiedAt: timestamp("verified_at", {
      mode: "date",
      withTimezone: true,
    }),
    verifiedBy: text("verified_by"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_evidence_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("compliance_evidence_obligation_idx").on(table.obligationId),
  ]
);

export const complianceExceptions = xforge.table(
  "compliance_exceptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    obligationId: uuid("obligation_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    ownerId: text("owner_id"),
    dueAt: timestamp("due_at", { mode: "date", withTimezone: true }),
    waiverExpiresAt: timestamp("waiver_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", {
      mode: "date",
      withTimezone: true,
    }),
    resolvedAt: timestamp("resolved_at", {
      mode: "date",
      withTimezone: true,
    }),
    resolutionNotes: text("resolution_notes"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_exceptions_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("compliance_exceptions_requirement_idx").on(table.requirementId),
  ]
);

export const complianceCorrectiveActions = xforge.table(
  "compliance_corrective_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    obligationId: uuid("obligation_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    exceptionId: uuid("exception_id"),
    title: text("title").notNull(),
    description: text("description"),
    ownerId: text("owner_id"),
    status: varchar("status", { length: 32 }).notNull(),
    dueAt: timestamp("due_at", { mode: "date", withTimezone: true }),
    completedAt: timestamp("completed_at", {
      mode: "date",
      withTimezone: true,
    }),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_corrective_actions_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("compliance_corrective_actions_requirement_idx").on(
      table.requirementId
    ),
  ]
);

export const complianceFilings = xforge.table(
  "compliance_filings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    obligationId: uuid("obligation_id").notNull(),
    filingCode: varchar("filing_code", { length: 96 }).notNull(),
    title: text("title").notNull(),
    jurisdictionSource: text("jurisdiction_source").notNull(),
    dueAt: timestamp("due_at", { mode: "date", withTimezone: true }).notNull(),
    submittedAt: timestamp("submitted_at", {
      mode: "date",
      withTimezone: true,
    }),
    submittedBy: text("submitted_by"),
    status: varchar("status", { length: 32 }).notNull(),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    confirmationReference: text("confirmation_reference"),
    notes: text("notes"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_filings_tenant_company_status_due_idx").on(
      table.tenantId,
      table.companyId,
      table.status,
      table.dueAt
    ),
    uniqueIndex("compliance_filings_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.filingCode
    ),
  ]
);

export const complianceAlertStates = xforge.table(
  "compliance_alert_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    alertId: text("alert_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    actorId: text("actor_id"),
    reason: text("reason"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("compliance_alert_states_tenant_alert_unique").on(
      table.tenantId,
      table.alertId
    ),
    index("compliance_alert_states_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
  ]
);

export const complianceAuditReferences = xforge.table(
  "compliance_audit_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    auditEventId: uuid("audit_event_id"),
    action: varchar("action", { length: 128 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_audit_refs_tenant_entity_idx").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
    index("compliance_audit_refs_tenant_action_idx").on(
      table.tenantId,
      table.action
    ),
  ]
);

export const auditEvents = xforge.table(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    grantId: uuid("grant_id").references(() => companyGrants.id, {
      onDelete: "set null",
    }),
    actorId: text("actor_id").notNull(),
    actorType: varchar("actor_type", { length: 32 }).notNull().default("user"),
    actorRole: varchar("actor_role", { length: 64 }),
    module: varchar("module", { length: 64 }).notNull().default(""),
    surface: varchar("surface", { length: 64 }),
    route: text("route"),
    subjectType: varchar("subject_type", { length: 128 }),
    subjectId: text("subject_id"),
    action: varchar("action", { length: 128 }).notNull(),
    summary: text("summary").notNull().default(""),
    outcome: varchar("outcome", { length: 16 }).notNull().default("success"),
    targetType: varchar("target_type", { length: 128 }).notNull(),
    targetId: text("target_id").notNull(),
    targetDisplayName: text("target_display_name"),
    reason: text("reason").notNull(),
    policyReference: text("policy_reference"),
    approvalId: text("approval_id"),
    channel: varchar("channel", { length: 32 }),
    requestId: varchar("request_id", { length: 128 }).notNull(),
    operationId: varchar("operation_id", { length: 128 }),
    before: jsonb("before").$type<Record<string, unknown>>().notNull(),
    after: jsonb("after").$type<Record<string, unknown>>().notNull(),
    diff: jsonb("diff")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    occurredAt: timestamp("occurred_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_events_tenant_occurred_idx").on(
      table.tenantId,
      table.occurredAt
    ),
    index("audit_events_tenant_actor_occurred_idx").on(
      table.tenantId,
      table.actorId,
      table.occurredAt
    ),
    index("audit_events_tenant_action_occurred_idx").on(
      table.tenantId,
      table.action,
      table.occurredAt
    ),
    index("audit_events_tenant_module_occurred_idx").on(
      table.tenantId,
      table.module,
      table.occurredAt
    ),
    index("audit_events_tenant_subject_occurred_idx").on(
      table.tenantId,
      table.subjectType,
      table.subjectId,
      table.occurredAt
    ),
    index("audit_events_tenant_target_idx").on(
      table.tenantId,
      table.targetType,
      table.targetId
    ),
    index("audit_events_tenant_request_id_idx").on(
      table.tenantId,
      table.requestId
    ),
    index("audit_events_tenant_operation_id_idx").on(
      table.tenantId,
      table.operationId
    ),
    index("audit_events_company_occurred_idx").on(
      table.companyId,
      table.occurredAt
    ),
  ]
);

export const hrOrgUnits = xforge.table(
  "hr_org_units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 96 }).notNull(),
    name: text("name").notNull(),
    unitType: varchar("unit_type", { length: 64 }).notNull(),
    parentUnitId: uuid("parent_unit_id"),
    managerEmployeeId: text("manager_employee_id"),
    costCenterCode: varchar("cost_center_code", { length: 96 }),
    locationCode: varchar("location_code", { length: 96 }),
    legalEntityCode: varchar("legal_entity_code", { length: 96 }),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentUnitId],
      foreignColumns: [table.id],
      name: "hr_org_units_parent_unit_id_hr_org_units_id_fk",
    }).onDelete("set null"),
    index("hr_org_units_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_units_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("hr_org_units_tenant_company_type_idx").on(
      table.tenantId,
      table.companyId,
      table.unitType
    ),
    index("hr_org_units_tenant_company_parent_idx").on(
      table.tenantId,
      table.companyId,
      table.parentUnitId
    ),
    index("hr_org_units_tenant_company_location_idx").on(
      table.tenantId,
      table.companyId,
      table.locationCode
    ),
    index("hr_org_units_tenant_company_legal_entity_idx").on(
      table.tenantId,
      table.companyId,
      table.legalEntityCode
    ),
    uniqueIndex("hr_org_units_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
  ]
);

export const hrOrgPositions = xforge.table(
  "hr_org_positions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 96 }).notNull(),
    title: text("title").notNull(),
    organizationUnitId: uuid("organization_unit_id")
      .notNull()
      .references(() => hrOrgUnits.id, { onDelete: "restrict" }),
    managerEmployeeId: text("manager_employee_id"),
    costCenterCode: varchar("cost_center_code", { length: 96 }),
    locationCode: varchar("location_code", { length: 96 }),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("hr_org_positions_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_positions_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("hr_org_positions_tenant_company_unit_idx").on(
      table.tenantId,
      table.companyId,
      table.organizationUnitId
    ),
    index("hr_org_positions_tenant_company_location_idx").on(
      table.tenantId,
      table.companyId,
      table.locationCode
    ),
    uniqueIndex("hr_org_positions_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
  ]
);

export const hrOrgReportingRelationships = xforge.table(
  "hr_org_reporting_relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    managerEmployeeId: text("manager_employee_id").notNull(),
    relationshipType: varchar("relationship_type", { length: 64 }).notNull(),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    reason: text("reason"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("hr_org_reporting_relationships_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_reporting_relationships_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("hr_org_reporting_relationships_tenant_company_manager_idx").on(
      table.tenantId,
      table.companyId,
      table.managerEmployeeId
    ),
    uniqueIndex(
      "hr_org_reporting_relationships_tenant_company_identity_unique"
    ).on(
      table.tenantId,
      table.companyId,
      table.employeeId,
      table.managerEmployeeId,
      table.relationshipType,
      table.effectiveFrom
    ),
  ]
);

export const hrOrgStructureAuditReferences = xforge.table(
  "hr_org_structure_audit_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    auditEventId: uuid("audit_event_id")
      .notNull()
      .references(() => auditEvents.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: text("entity_id").notNull(),
    action: varchar("action", { length: 128 }).notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("hr_org_structure_audit_refs_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_structure_audit_refs_tenant_entity_idx").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
    uniqueIndex("hr_org_structure_audit_refs_tenant_audit_event_unique").on(
      table.tenantId,
      table.auditEventId
    ),
  ]
);

export const tenantsRelations = relations(tenants, ({ many }) => ({
  companies: many(companies),
  complianceAlertStates: many(complianceAlertStates),
  complianceAuditReferences: many(complianceAuditReferences),
  complianceCorrectiveActions: many(complianceCorrectiveActions),
  complianceEvidenceArtifacts: many(complianceEvidenceArtifacts),
  complianceExceptions: many(complianceExceptions),
  complianceFilings: many(complianceFilings),
  complianceObligations: many(complianceObligations),
  complianceWorkerProfiles: many(complianceWorkerProfiles),
  customers: many(customers),
  hrOffboardingCases: many(hrOffboardingCases),
  lamAttendanceRecords: many(lamAttendanceRecords),
  lamAttendanceCorrections: many(lamAttendanceCorrections),
  lamAuditReferences: many(lamAuditReferences),
  lamLeaveApplications: many(lamLeaveApplications),
  lamLeaveApprovalRoutes: many(lamLeaveApprovalRoutes),
  lamLeaveBalances: many(lamLeaveBalances),
  lamLeaveBlackoutPeriods: many(lamLeaveBlackoutPeriods),
  lamLeaveCarryForwardRules: many(lamLeaveCarryForwardRules),
  lamLeaveDocuments: many(lamLeaveDocuments),
  lamLeaveEntitlementRules: many(lamLeaveEntitlementRules),
  lamLeaveTypes: many(lamLeaveTypes),
  hrOrgPositions: many(hrOrgPositions),
  hrOrgReportingRelationships: many(hrOrgReportingRelationships),
  hrOrgStructureAuditReferences: many(hrOrgStructureAuditReferences),
  hrOrgUnits: many(hrOrgUnits),
  hrDelegationGrants: many(hrDelegationGrants),
  moduleConsoleOperatorAssignments: many(moduleConsoleOperatorAssignments),
  memberships: many(tenantMemberships),
  webhookEndpoints: many(webhookEndpoints),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [companies.tenantId],
    references: [tenants.id],
  }),
  parent: one(companies, {
    fields: [companies.parentCompanyId],
    references: [companies.id],
    relationName: "companyHierarchy",
  }),
  children: many(companies, {
    relationName: "companyHierarchy",
  }),
  complianceAlertStates: many(complianceAlertStates),
  complianceAuditReferences: many(complianceAuditReferences),
  complianceCorrectiveActions: many(complianceCorrectiveActions),
  complianceEvidenceArtifacts: many(complianceEvidenceArtifacts),
  complianceExceptions: many(complianceExceptions),
  complianceFilings: many(complianceFilings),
  complianceObligations: many(complianceObligations),
  complianceWorkerProfiles: many(complianceWorkerProfiles),
  hrOffboardingCases: many(hrOffboardingCases),
  lamAttendanceRecords: many(lamAttendanceRecords),
  lamAttendanceCorrections: many(lamAttendanceCorrections),
  lamAuditReferences: many(lamAuditReferences),
  lamLeaveApplications: many(lamLeaveApplications),
  lamLeaveApprovalRoutes: many(lamLeaveApprovalRoutes),
  lamLeaveBalances: many(lamLeaveBalances),
  lamLeaveBlackoutPeriods: many(lamLeaveBlackoutPeriods),
  lamLeaveCarryForwardRules: many(lamLeaveCarryForwardRules),
  lamLeaveDocuments: many(lamLeaveDocuments),
  lamLeaveEntitlementRules: many(lamLeaveEntitlementRules),
  lamLeaveTypes: many(lamLeaveTypes),
  hrOrgPositions: many(hrOrgPositions),
  hrOrgReportingRelationships: many(hrOrgReportingRelationships),
  hrOrgStructureAuditReferences: many(hrOrgStructureAuditReferences),
  hrOrgUnits: many(hrOrgUnits),
  hrDelegationGrants: many(hrDelegationGrants),
  moduleConsoleOperatorAssignments: many(moduleConsoleOperatorAssignments),
  grants: many(companyGrants),
  webhookEndpoints: many(webhookEndpoints),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
  })
);

export const companyGrantsRelations = relations(companyGrants, ({ one }) => ({
  tenant: one(tenants, {
    fields: [companyGrants.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [companyGrants.companyId],
    references: [companies.id],
  }),
}));

export const notificationInboxRelations = relations(
  notificationInbox,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [notificationInbox.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [notificationInbox.companyId],
      references: [companies.id],
    }),
  })
);

export const webhookEndpointsRelations = relations(
  webhookEndpoints,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [webhookEndpoints.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [webhookEndpoints.companyId],
      references: [companies.id],
    }),
  })
);

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditEvents.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [auditEvents.companyId],
    references: [companies.id],
  }),
  grant: one(companyGrants, {
    fields: [auditEvents.grantId],
    references: [companyGrants.id],
  }),
}));

export const complianceObligationsRelations = relations(
  complianceObligations,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceObligations.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceObligations.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceWorkerProfilesRelations = relations(
  complianceWorkerProfiles,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceWorkerProfiles.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceWorkerProfiles.companyId],
      references: [companies.id],
    }),
  })
);

export const employeeRecordAssignmentHistoryRelations = relations(
  employeeRecordAssignmentHistory,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [employeeRecordAssignmentHistory.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [employeeRecordAssignmentHistory.companyId],
      references: [companies.id],
    }),
  })
);

export const employeeRecordStatusHistoryRelations = relations(
  employeeRecordStatusHistory,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [employeeRecordStatusHistory.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [employeeRecordStatusHistory.companyId],
      references: [companies.id],
    }),
  })
);

export const hrOffboardingCasesRelations = relations(
  hrOffboardingCases,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [hrOffboardingCases.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [hrOffboardingCases.companyId],
      references: [companies.id],
    }),
  })
);

export const lamAttendanceRecordsRelations = relations(
  lamAttendanceRecords,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [lamAttendanceRecords.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamAttendanceRecords.companyId],
      references: [companies.id],
    }),
    corrections: many(lamAttendanceCorrections),
  })
);

export const lamAttendanceCorrectionsRelations = relations(
  lamAttendanceCorrections,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamAttendanceCorrections.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamAttendanceCorrections.companyId],
      references: [companies.id],
    }),
    attendanceRecord: one(lamAttendanceRecords, {
      fields: [lamAttendanceCorrections.attendanceRecordId],
      references: [lamAttendanceRecords.id],
    }),
    approvalRoute: one(lamLeaveApprovalRoutes, {
      fields: [lamAttendanceCorrections.approvalRouteId],
      references: [lamLeaveApprovalRoutes.id],
    }),
  })
);

export const lamCompanyAttendanceSettingsRelations = relations(
  lamCompanyAttendanceSettings,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamCompanyAttendanceSettings.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamCompanyAttendanceSettings.companyId],
      references: [companies.id],
    }),
  })
);

export const lamLeaveTypesRelations = relations(lamLeaveTypes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [lamLeaveTypes.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [lamLeaveTypes.companyId],
    references: [companies.id],
  }),
}));

export const lamLeaveEntitlementRulesRelations = relations(
  lamLeaveEntitlementRules,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamLeaveEntitlementRules.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamLeaveEntitlementRules.companyId],
      references: [companies.id],
    }),
  })
);

export const lamLeaveCarryForwardRulesRelations = relations(
  lamLeaveCarryForwardRules,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamLeaveCarryForwardRules.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamLeaveCarryForwardRules.companyId],
      references: [companies.id],
    }),
  })
);

export const lamLeaveBlackoutPeriodsRelations = relations(
  lamLeaveBlackoutPeriods,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamLeaveBlackoutPeriods.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamLeaveBlackoutPeriods.companyId],
      references: [companies.id],
    }),
  })
);

export const lamLeaveApprovalRoutesRelations = relations(
  lamLeaveApprovalRoutes,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamLeaveApprovalRoutes.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamLeaveApprovalRoutes.companyId],
      references: [companies.id],
    }),
  })
);

export const lamLeaveBalancesRelations = relations(
  lamLeaveBalances,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamLeaveBalances.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamLeaveBalances.companyId],
      references: [companies.id],
    }),
  })
);

export const lamLeaveApplicationsRelations = relations(
  lamLeaveApplications,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamLeaveApplications.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamLeaveApplications.companyId],
      references: [companies.id],
    }),
  })
);

export const lamLeaveDocumentsRelations = relations(
  lamLeaveDocuments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamLeaveDocuments.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamLeaveDocuments.companyId],
      references: [companies.id],
    }),
  })
);

export const lamAuditReferencesRelations = relations(
  lamAuditReferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lamAuditReferences.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [lamAuditReferences.companyId],
      references: [companies.id],
    }),
    auditEvent: one(auditEvents, {
      fields: [lamAuditReferences.auditEventId],
      references: [auditEvents.id],
    }),
  })
);

export const moduleConsoleOperatorAssignmentsRelations = relations(
  moduleConsoleOperatorAssignments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [moduleConsoleOperatorAssignments.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [moduleConsoleOperatorAssignments.companyId],
      references: [companies.id],
    }),
  })
);

export const hrDelegationGrantsRelations = relations(
  hrDelegationGrants,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [hrDelegationGrants.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [hrDelegationGrants.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceEvidenceArtifactsRelations = relations(
  complianceEvidenceArtifacts,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceEvidenceArtifacts.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceEvidenceArtifacts.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceExceptionsRelations = relations(
  complianceExceptions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceExceptions.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceExceptions.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceCorrectiveActionsRelations = relations(
  complianceCorrectiveActions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceCorrectiveActions.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceCorrectiveActions.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceFilingsRelations = relations(
  complianceFilings,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceFilings.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceFilings.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceAlertStatesRelations = relations(
  complianceAlertStates,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceAlertStates.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceAlertStates.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceAuditReferencesRelations = relations(
  complianceAuditReferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceAuditReferences.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceAuditReferences.companyId],
      references: [companies.id],
    }),
  })
);

export const hrOrgUnitsRelations = relations(hrOrgUnits, ({ one }) => ({
  tenant: one(tenants, {
    fields: [hrOrgUnits.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [hrOrgUnits.companyId],
    references: [companies.id],
  }),
}));

export const hrOrgPositionsRelations = relations(hrOrgPositions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [hrOrgPositions.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [hrOrgPositions.companyId],
    references: [companies.id],
  }),
  organizationUnit: one(hrOrgUnits, {
    fields: [hrOrgPositions.organizationUnitId],
    references: [hrOrgUnits.id],
  }),
}));

export const hrOrgReportingRelationshipsRelations = relations(
  hrOrgReportingRelationships,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [hrOrgReportingRelationships.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [hrOrgReportingRelationships.companyId],
      references: [companies.id],
    }),
  })
);

export const hrOrgStructureAuditReferencesRelations = relations(
  hrOrgStructureAuditReferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [hrOrgStructureAuditReferences.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [hrOrgStructureAuditReferences.companyId],
      references: [companies.id],
    }),
    auditEvent: one(auditEvents, {
      fields: [hrOrgStructureAuditReferences.auditEventId],
      references: [auditEvents.id],
    }),
  })
);

export const databaseSchema: Omit<
  typeof import("./schema.ts"),
  "databaseSchema"
> = {
  auditEvents,
  auditEventsRelations,
  companies,
  companiesRelations,
  companyGrants,
  companyGrantsRelations,
  complianceAlertStates,
  complianceAlertStatesRelations,
  complianceAuditReferences,
  complianceAuditReferencesRelations,
  complianceCorrectiveActions,
  complianceCorrectiveActionsRelations,
  complianceEvidenceArtifacts,
  complianceEvidenceArtifactsRelations,
  complianceExceptions,
  complianceExceptionsRelations,
  complianceFilings,
  complianceFilingsRelations,
  complianceObligations,
  complianceObligationsRelations,
  complianceWorkerProfiles,
  complianceWorkerProfilesRelations,
  employeeRecordAssignmentHistory,
  employeeRecordAssignmentHistoryRelations,
  employeeRecordStatusHistory,
  employeeRecordStatusHistoryRelations,
  employeeUserAccounts,
  customers,
  customersRelations,
  hrOffboardingCases,
  hrOffboardingCasesRelations,
  lamAttendanceRecords,
  lamAttendanceRecordsRelations,
  lamAttendanceCorrections,
  lamAttendanceCorrectionsRelations,
  lamCompanyAttendanceSettings,
  lamCompanyAttendanceSettingsRelations,
  lamAuditReferences,
  lamAuditReferencesRelations,
  lamLeaveApplications,
  lamLeaveApplicationsRelations,
  lamLeaveApprovalRoutes,
  lamLeaveApprovalRoutesRelations,
  lamLeaveBalances,
  lamLeaveBalancesRelations,
  lamLeaveBlackoutPeriods,
  lamLeaveBlackoutPeriodsRelations,
  lamLeaveCarryForwardRules,
  lamLeaveCarryForwardRulesRelations,
  lamLeaveDocuments,
  lamLeaveDocumentsRelations,
  lamLeaveEntitlementRules,
  lamLeaveEntitlementRulesRelations,
  lamLeaveTypes,
  lamLeaveTypesRelations,
  hrOrgPositions,
  hrOrgPositionsRelations,
  hrOrgReportingRelationships,
  hrOrgReportingRelationshipsRelations,
  hrOrgStructureAuditReferences,
  hrOrgStructureAuditReferencesRelations,
  hrOrgUnits,
  hrOrgUnitsRelations,
  hrDelegationGrants,
  hrDelegationGrantsRelations,
  moduleConsoleOperatorAssignments,
  moduleConsoleOperatorAssignmentsRelations,
  notificationInbox,
  notificationInboxRelations,
  tenantMemberships,
  tenantMembershipsRelations,
  tenants,
  tenantsRelations,
  webhookEndpoints,
  webhookEndpointsRelations,
  xforge,
};

export type Tenant = InferSelectModel<typeof tenants>;
export type NewTenant = InferInsertModel<typeof tenants>;
export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;
export type ComplianceObligation = InferSelectModel<
  typeof complianceObligations
>;
export type NewComplianceObligation = InferInsertModel<
  typeof complianceObligations
>;
export type ComplianceWorkerProfile = InferSelectModel<
  typeof complianceWorkerProfiles
>;
export type NewComplianceWorkerProfile = InferInsertModel<
  typeof complianceWorkerProfiles
>;
export type EmployeeRecordAssignmentHistory = InferSelectModel<
  typeof employeeRecordAssignmentHistory
>;
export type NewEmployeeRecordAssignmentHistory = InferInsertModel<
  typeof employeeRecordAssignmentHistory
>;
export type EmployeeRecordStatusHistory = InferSelectModel<
  typeof employeeRecordStatusHistory
>;
export type NewEmployeeRecordStatusHistory = InferInsertModel<
  typeof employeeRecordStatusHistory
>;
export type HrOffboardingCase = InferSelectModel<typeof hrOffboardingCases>;
export type NewHrOffboardingCase = InferInsertModel<typeof hrOffboardingCases>;
export type LamAttendanceRecordRow = InferSelectModel<
  typeof lamAttendanceRecords
>;
export type NewLamAttendanceRecordRow = InferInsertModel<
  typeof lamAttendanceRecords
>;
export type LamAttendanceCorrectionRow = InferSelectModel<
  typeof lamAttendanceCorrections
>;
export type NewLamAttendanceCorrectionRow = InferInsertModel<
  typeof lamAttendanceCorrections
>;
export type LamCompanyAttendanceSettingsRow = InferSelectModel<
  typeof lamCompanyAttendanceSettings
>;
export type NewLamCompanyAttendanceSettingsRow = InferInsertModel<
  typeof lamCompanyAttendanceSettings
>;
export type LamLeaveTypeRow = InferSelectModel<typeof lamLeaveTypes>;
export type NewLamLeaveTypeRow = InferInsertModel<typeof lamLeaveTypes>;
export type LamLeaveEntitlementRuleRow = InferSelectModel<
  typeof lamLeaveEntitlementRules
>;
export type NewLamLeaveEntitlementRuleRow = InferInsertModel<
  typeof lamLeaveEntitlementRules
>;
export type LamLeaveCarryForwardRuleRow = InferSelectModel<
  typeof lamLeaveCarryForwardRules
>;
export type NewLamLeaveCarryForwardRuleRow = InferInsertModel<
  typeof lamLeaveCarryForwardRules
>;
export type LamLeaveBalanceRow = InferSelectModel<typeof lamLeaveBalances>;
export type NewLamLeaveBalanceRow = InferInsertModel<typeof lamLeaveBalances>;
export type LamLeaveBlackoutPeriodRow = InferSelectModel<
  typeof lamLeaveBlackoutPeriods
>;
export type NewLamLeaveBlackoutPeriodRow = InferInsertModel<
  typeof lamLeaveBlackoutPeriods
>;
export type LamLeaveApprovalRouteRow = InferSelectModel<
  typeof lamLeaveApprovalRoutes
>;
export type NewLamLeaveApprovalRouteRow = InferInsertModel<
  typeof lamLeaveApprovalRoutes
>;
export type LamLeaveApplicationRow = InferSelectModel<
  typeof lamLeaveApplications
>;
export type NewLamLeaveApplicationRow = InferInsertModel<
  typeof lamLeaveApplications
>;
export type LamLeaveDocumentRow = InferSelectModel<typeof lamLeaveDocuments>;
export type NewLamLeaveDocumentRow = InferInsertModel<typeof lamLeaveDocuments>;
export type LamAuditReference = InferSelectModel<typeof lamAuditReferences>;
export type NewLamAuditReference = InferInsertModel<typeof lamAuditReferences>;
export type ComplianceEvidenceArtifact = InferSelectModel<
  typeof complianceEvidenceArtifacts
>;
export type NewComplianceEvidenceArtifact = InferInsertModel<
  typeof complianceEvidenceArtifacts
>;
export type ComplianceException = InferSelectModel<typeof complianceExceptions>;
export type NewComplianceException = InferInsertModel<
  typeof complianceExceptions
>;
export type ComplianceCorrectiveAction = InferSelectModel<
  typeof complianceCorrectiveActions
>;
export type NewComplianceCorrectiveAction = InferInsertModel<
  typeof complianceCorrectiveActions
>;
export type ComplianceFiling = InferSelectModel<typeof complianceFilings>;
export type NewComplianceFiling = InferInsertModel<typeof complianceFilings>;
export type ComplianceAlertState = InferSelectModel<
  typeof complianceAlertStates
>;
export type NewComplianceAlertState = InferInsertModel<
  typeof complianceAlertStates
>;
export type ComplianceAuditReference = InferSelectModel<
  typeof complianceAuditReferences
>;
export type NewComplianceAuditReference = InferInsertModel<
  typeof complianceAuditReferences
>;
export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;
export type TenantMembership = InferSelectModel<typeof tenantMemberships>;
export type NewTenantMembership = InferInsertModel<typeof tenantMemberships>;
export type CompanyGrant = InferSelectModel<typeof companyGrants>;
export type NewCompanyGrant = InferInsertModel<typeof companyGrants>;
export type NotificationInboxEntry = InferSelectModel<typeof notificationInbox>;
export type NewNotificationInboxEntry = InferInsertModel<
  typeof notificationInbox
>;
export type WebhookEndpoint = InferSelectModel<typeof webhookEndpoints>;
export type NewWebhookEndpoint = InferInsertModel<typeof webhookEndpoints>;
export type AuditEvent = InferSelectModel<typeof auditEvents>;
export type NewAuditEvent = InferInsertModel<typeof auditEvents>;
export type HrOrgUnit = InferSelectModel<typeof hrOrgUnits>;
export type NewHrOrgUnit = InferInsertModel<typeof hrOrgUnits>;
export type HrOrgPosition = InferSelectModel<typeof hrOrgPositions>;
export type NewHrOrgPosition = InferInsertModel<typeof hrOrgPositions>;
export type HrOrgReportingRelationship = InferSelectModel<
  typeof hrOrgReportingRelationships
>;
export type NewHrOrgReportingRelationship = InferInsertModel<
  typeof hrOrgReportingRelationships
>;
export type HrOrgStructureAuditReference = InferSelectModel<
  typeof hrOrgStructureAuditReferences
>;
export type NewHrOrgStructureAuditReference = InferInsertModel<
  typeof hrOrgStructureAuditReferences
>;
export type ModuleConsoleOperatorAssignment = InferSelectModel<
  typeof moduleConsoleOperatorAssignments
>;
export type NewModuleConsoleOperatorAssignment = InferInsertModel<
  typeof moduleConsoleOperatorAssignments
>;
export type HrDelegationGrant = InferSelectModel<typeof hrDelegationGrants>;
export type NewHrDelegationGrant = InferInsertModel<typeof hrDelegationGrants>;
