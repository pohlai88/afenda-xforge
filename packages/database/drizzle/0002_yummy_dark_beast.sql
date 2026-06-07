CREATE TABLE "xforge"."audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_id" uuid,
	"grant_id" uuid,
	"actor_id" text NOT NULL,
	"actor_type" varchar(32) DEFAULT 'user' NOT NULL,
	"actor_role" varchar(64),
	"module" varchar(64) DEFAULT '' NOT NULL,
	"surface" varchar(64),
	"route" text,
	"subject_type" varchar(128),
	"subject_id" text,
	"action" varchar(128) NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"outcome" varchar(16) DEFAULT 'success' NOT NULL,
	"target_type" varchar(128) NOT NULL,
	"target_id" text NOT NULL,
	"target_display_name" text,
	"reason" text NOT NULL,
	"policy_reference" text,
	"approval_id" text,
	"channel" varchar(32),
	"request_id" varchar(128) NOT NULL,
	"operation_id" varchar(128),
	"before" jsonb NOT NULL,
	"after" jsonb NOT NULL,
	"diff" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."audit_events" ADD CONSTRAINT "audit_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."audit_events" ADD CONSTRAINT "audit_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "xforge"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xforge"."audit_events" ADD CONSTRAINT "audit_events_grant_id_company_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "xforge"."company_grants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_tenant_occurred_idx" ON "xforge"."audit_events" USING btree ("tenant_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_actor_occurred_idx" ON "xforge"."audit_events" USING btree ("tenant_id","actor_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_action_occurred_idx" ON "xforge"."audit_events" USING btree ("tenant_id","action","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_module_occurred_idx" ON "xforge"."audit_events" USING btree ("tenant_id","module","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_subject_occurred_idx" ON "xforge"."audit_events" USING btree ("tenant_id","subject_type","subject_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_target_idx" ON "xforge"."audit_events" USING btree ("tenant_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_request_id_idx" ON "xforge"."audit_events" USING btree ("tenant_id","request_id");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_operation_id_idx" ON "xforge"."audit_events" USING btree ("tenant_id","operation_id");--> statement-breakpoint
CREATE INDEX "audit_events_company_occurred_idx" ON "xforge"."audit_events" USING btree ("company_id","occurred_at");