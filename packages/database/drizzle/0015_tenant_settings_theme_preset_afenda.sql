ALTER TABLE "xforge"."tenant_settings" ALTER COLUMN "theme_preset" SET DEFAULT 'afenda';--> statement-breakpoint
UPDATE "xforge"."tenant_settings" SET "theme_preset" = 'afenda' WHERE "theme_preset" = 'xforge';--> statement-breakpoint
UPDATE "xforge"."tenant_settings" SET "theme_preset" = 'vercel-geist' WHERE "theme_preset" = 'vercel';
