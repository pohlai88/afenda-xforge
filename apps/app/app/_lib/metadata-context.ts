import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";

export type AppMetadataContextInput = {
  tenantId: string;
  featureId: string;
  userId: string;
  permissions?: readonly string[];
  locale?: string;
  mode?: MetadataRenderContext["mode"];
  state?: MetadataRenderContext["state"];
};

export function createAppMetadataContext(
  input: AppMetadataContextInput
): MetadataRenderContext {
  const permissions = Object.fromEntries(
    (input.permissions ?? []).map((permission) => [permission, true])
  );

  return createMetadataRenderContext(
    {
      actorId: input.userId,
      tenantId: input.tenantId,
      permissions,
      featureId: input.featureId,
      locale: input.locale ?? "en-US",
      diagnosticsEnabled: process.env.NODE_ENV === "development",
    },
    {
      mode: input.mode ?? "read",
      state: input.state ?? "ready",
      surfaceId: input.featureId,
      routeId: `app/${input.featureId}`,
    }
  );
}
