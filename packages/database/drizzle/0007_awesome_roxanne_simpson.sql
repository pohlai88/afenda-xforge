CREATE TABLE "xforge"."hr_org_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"code" varchar(96) NOT NULL,
	"title" text NOT NULL,
	"organization_unit_id" uuid NOT NULL,
	"manager_employee_id" text,
	"cost_center_code" varchar(96),
	"location_code" varchar(96),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."hr_org_reporting_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" text NOT NULL,
	"manager_employee_id" text NOT NULL,
	"relationship_type" varchar(64) NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."hr_org_structure_audit_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"audit_event_id" uuid NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" text NOT NULL,
	"action" varchar(128) NOT NULL,
	"summary" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xforge"."hr_org_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"code" varchar(96) NOT NULL,
	"name" text NOT NULL,
	"unit_type" varchar(64) NOT NULL,
	"parent_unit_id" uuid,
	"manager_employee_id" text,
	"cost_center_code" varchar(96),
	"location_code" varchar(96),
	"legal_entity_code" varchar(96),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_positions" ADD CONSTRAINT "hr_org_positions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_positions" ADD CONSTRAINT "hr_org_positions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_positions" ADD CONSTRAINT "hr_org_positions_organization_unit_id_hr_org_units_id_fk" FOREIGN KEY ("organization_unit_id") REFERENCES "xforge"."hr_org_units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_reporting_relationships" ADD CONSTRAINT "hr_org_reporting_relationships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_reporting_relationships" ADD CONSTRAINT "hr_org_reporting_relationships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_structure_audit_references" ADD CONSTRAINT "hr_org_structure_audit_references_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_structure_audit_references" ADD CONSTRAINT "hr_org_structure_audit_references_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_structure_audit_references" ADD CONSTRAINT "hr_org_structure_audit_references_audit_event_id_audit_events_id_fk" FOREIGN KEY ("audit_event_id") REFERENCES "xforge"."audit_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_units" ADD CONSTRAINT "hr_org_units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_units" ADD CONSTRAINT "hr_org_units_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."hr_org_units" ADD CONSTRAINT "hr_org_units_parent_unit_id_hr_org_units_id_fk" FOREIGN KEY ("parent_unit_id") REFERENCES "xforge"."hr_org_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_org_positions_tenant_company_idx" ON "xforge"."hr_org_positions" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE INDEX "hr_org_positions_tenant_company_status_idx" ON "xforge"."hr_org_positions" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "hr_org_positions_tenant_company_unit_idx" ON "xforge"."hr_org_positions" USING btree ("tenant_id","company_id","organization_unit_id");--> statement-breakpoint
CREATE INDEX "hr_org_positions_tenant_company_location_idx" ON "xforge"."hr_org_positions" USING btree ("tenant_id","company_id","location_code");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_org_positions_tenant_company_code_unique" ON "xforge"."hr_org_positions" USING btree ("tenant_id","company_id","code");--> statement-breakpoint
CREATE INDEX "hr_org_reporting_relationships_tenant_company_idx" ON "xforge"."hr_org_reporting_relationships" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE INDEX "hr_org_reporting_relationships_tenant_company_employee_idx" ON "xforge"."hr_org_reporting_relationships" USING btree ("tenant_id","company_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_org_reporting_relationships_tenant_company_manager_idx" ON "xforge"."hr_org_reporting_relationships" USING btree ("tenant_id","company_id","manager_employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_org_reporting_relationships_tenant_company_identity_unique" ON "xforge"."hr_org_reporting_relationships" USING btree ("tenant_id","company_id","employee_id","manager_employee_id","relationship_type","effective_from");--> statement-breakpoint
CREATE INDEX "hr_org_structure_audit_refs_tenant_company_idx" ON "xforge"."hr_org_structure_audit_references" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE INDEX "hr_org_structure_audit_refs_tenant_entity_idx" ON "xforge"."hr_org_structure_audit_references" USING btree ("tenant_id","entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_org_structure_audit_refs_tenant_audit_event_unique" ON "xforge"."hr_org_structure_audit_references" USING btree ("tenant_id","audit_event_id");--> statement-breakpoint
CREATE INDEX "hr_org_units_tenant_company_idx" ON "xforge"."hr_org_units" USING btree ("tenant_id","company_id");--> statement-breakpoint
CREATE INDEX "hr_org_units_tenant_company_status_idx" ON "xforge"."hr_org_units" USING btree ("tenant_id","company_id","status");--> statement-breakpoint
CREATE INDEX "hr_org_units_tenant_company_type_idx" ON "xforge"."hr_org_units" USING btree ("tenant_id","company_id","unit_type");--> statement-breakpoint
CREATE INDEX "hr_org_units_tenant_company_parent_idx" ON "xforge"."hr_org_units" USING btree ("tenant_id","company_id","parent_unit_id");--> statement-breakpoint
CREATE INDEX "hr_org_units_tenant_company_location_idx" ON "xforge"."hr_org_units" USING btree ("tenant_id","company_id","location_code");--> statement-breakpoint
CREATE INDEX "hr_org_units_tenant_company_legal_entity_idx" ON "xforge"."hr_org_units" USING btree ("tenant_id","company_id","legal_entity_code");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_org_units_tenant_company_code_unique" ON "xforge"."hr_org_units" USING btree ("tenant_id","company_id","code");