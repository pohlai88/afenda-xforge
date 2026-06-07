import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
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
    index("companies_tenant_id_idx").on(table.tenantId),
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

export const tenantsRelations = relations(tenants, ({ many }) => ({
  companies: many(companies),
  customers: many(customers),
  memberships: many(tenantMemberships),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [companies.tenantId],
    references: [tenants.id],
  }),
  grants: many(companyGrants),
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

export type Tenant = InferSelectModel<typeof tenants>;
export type NewTenant = InferInsertModel<typeof tenants>;
export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;
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
export type AuditEvent = InferSelectModel<typeof auditEvents>;
export type NewAuditEvent = InferInsertModel<typeof auditEvents>;
