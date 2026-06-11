CREATE TABLE IF NOT EXISTS "xforge"."user_appearance_preferences" (
  "tenant_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "theme_preset" varchar(32),
  "branding" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_appearance_preferences_tenant_id_user_id_pk" PRIMARY KEY("tenant_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "xforge"."user_appearance_preferences" ADD CONSTRAINT "user_appearance_preferences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_appearance_preferences_user_id_idx" ON "xforge"."user_appearance_preferences" USING btree ("user_id");
