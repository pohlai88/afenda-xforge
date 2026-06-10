CREATE TABLE "xforge"."tenant_settings" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"default_locale" varchar(16) DEFAULT 'en' NOT NULL,
	"default_timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
	"customization_mode" varchar(32),
	"theme_preset" varchar(32) DEFAULT 'xforge' NOT NULL,
	"branding" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xforge"."tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;
