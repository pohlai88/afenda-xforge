CREATE TABLE IF NOT EXISTS "xforge"."user_workspace_preferences" (
  "tenant_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "shortcuts" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_workspace_preferences_tenant_id_user_id_pk" PRIMARY KEY("tenant_id","user_id")
);

ALTER TABLE "xforge"."user_workspace_preferences" ADD CONSTRAINT "user_workspace_preferences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "user_workspace_preferences_user_id_idx" ON "xforge"."user_workspace_preferences" USING btree ("user_id");

CREATE TABLE IF NOT EXISTS "xforge"."tenant_keyboard_shortcut_policies" (
  "tenant_id" uuid PRIMARY KEY NOT NULL,
  "allow_user_customize" boolean DEFAULT false NOT NULL,
  "allow_fn_key_bindings" boolean DEFAULT true NOT NULL,
  "locked_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "xforge"."tenant_keyboard_shortcut_policies" ADD CONSTRAINT "tenant_keyboard_shortcut_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "xforge"."tenants"("id") ON DELETE cascade ON UPDATE no action;
