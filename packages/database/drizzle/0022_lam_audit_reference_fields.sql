ALTER TABLE "xforge"."lam_audit_references" ADD COLUMN "actor_id" text;--> statement-breakpoint
ALTER TABLE "xforge"."lam_audit_references" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "xforge"."lam_audit_references" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "xforge"."lam_audit_references" ADD COLUMN "before" jsonb;--> statement-breakpoint
ALTER TABLE "xforge"."lam_audit_references" ADD COLUMN "after" jsonb;--> statement-breakpoint
ALTER TABLE "xforge"."lam_audit_references" ADD CONSTRAINT "lam_audit_refs_audit_event_id_audit_events_id_fk" FOREIGN KEY ("audit_event_id") REFERENCES "xforge"."audit_events"("id") ON DELETE cascade ON UPDATE no action;
