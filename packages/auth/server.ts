import "server-only";

import {
  companies,
  companyGrants,
  database,
  tenantMemberships,
  tenants,
  timeDatabaseQuery,
} from "@repo/database";
import { ForbiddenError, UnauthorizedError } from "@repo/errors";
import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { and, asc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { resolveTenantSlugFromHost } from "./host.ts";
import { loadAuthKeys } from "./keys.ts";

type SupabaseConfig = {
  publishableKey: string;
  url: string;
};

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type CookieToSet = {
  name: string;
  options?: CookieOptions;
  value: string;
};

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerClient>>;
type ServiceRoleSupabaseClient = ReturnType<typeof createClient>;

export type ActiveTenantMembership = {
  id: string;
  role: string;
  tenantId: string;
  userId: string;
};

export type ActiveTenantAccess = {
  membership: ActiveTenantMembership;
  user: User;
};

export type ActiveCompanyGrant = {
  companyCode: string;
  companyId: string;
  companyName: string;
  grant: string;
  grantId: string;
  tenantId: string;
  userId: string;
};

export type ActiveCompanyAccess = {
  company: ActiveCompanyGrant;
  membership: ActiveTenantMembership;
  user: User;
};

export const ACTIVE_COMPANY_COOKIE_NAME = "xforge_active_company_id";

const getSupabaseConfig = (): SupabaseConfig | null => {
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    loadAuthKeys();

  if (!(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && NEXT_PUBLIC_SUPABASE_URL)) {
    return null;
  }

  return {
    publishableKey: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: NEXT_PUBLIC_SUPABASE_URL,
  };
};

export const createServerSupabaseClient =
  async (): Promise<ServerSupabaseClient | null> => {
    const config = getSupabaseConfig();

    if (!config) {
      return null;
    }

    const cookieStore = await cookies();

    return createServerClient(config.url, config.publishableKey, {
      cookies: {
        getAll(): ReturnType<CookieStore["getAll"]> {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: CookieToSet[],
          _headers: Record<string, string>
        ): void {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Cookies can be read-only in some server contexts.
          }
        },
      },
    });
  };

export const createServiceRoleSupabaseClient =
  (): ServiceRoleSupabaseClient | null => {
    const {
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    } = loadAuthKeys();

    if (
      !(
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
        NEXT_PUBLIC_SUPABASE_URL &&
        SUPABASE_SERVICE_ROLE_KEY
      )
    ) {
      return null;
    }

    return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  };

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return data.session;
});

export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
});

export const getCurrentAuthenticatedUserId = async (): Promise<
  string | null
> => {
  const user = await getUser();

  return user?.id ?? null;
};

export const formatDemoUserIdEnv = (userId: string): string =>
  `XFORGE_DEMO_USER_ID="${userId}"`;

export const exchangeCodeForSession = async (
  code: string
): Promise<boolean> => {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  return !error;
};

export const verifyOtpCode = async ({
  tokenHash,
  type,
}: {
  tokenHash: string;
  type: EmailOtpType;
}): Promise<boolean> => {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  return !error;
};

export const requireAuth = async (): Promise<User> => {
  const user = await getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
};

const findActiveTenantMembership = async (
  userId: string
): Promise<ActiveTenantMembership | null> => {
  const [membership] = await timeDatabaseQuery(
    () =>
      database
        .select({
          id: tenantMemberships.id,
          role: tenantMemberships.role,
          tenantId: tenantMemberships.tenantId,
          userId: tenantMemberships.userId,
        })
        .from(tenantMemberships)
        .where(eq(tenantMemberships.userId, userId))
        .orderBy(asc(tenantMemberships.createdAt))
        .limit(1),
    {
      operation: "select",
      resource: "tenant_memberships",
      metadata: {
        userId,
      },
    }
  );

  return membership ?? null;
};

const findTenantMembership = async ({
  tenantId,
  userId,
}: {
  tenantId: string;
  userId: string;
}): Promise<ActiveTenantMembership | null> => {
  const [membership] = await timeDatabaseQuery(
    () =>
      database
        .select({
          id: tenantMemberships.id,
          role: tenantMemberships.role,
          tenantId: tenantMemberships.tenantId,
          userId: tenantMemberships.userId,
        })
        .from(tenantMemberships)
        .where(
          and(
            eq(tenantMemberships.tenantId, tenantId),
            eq(tenantMemberships.userId, userId)
          )
        )
        .limit(1),
    {
      operation: "select",
      resource: "tenant_memberships",
      metadata: {
        tenantId,
        userId,
      },
    }
  );

  return membership ?? null;
};

export const resolveTenantByHost = async (
  host: string
): Promise<{ tenantId: string; slug: string } | null> => {
  const slug = resolveTenantSlugFromHost(host);

  if (!slug) {
    return null;
  }

  const [tenant] = await timeDatabaseQuery(
    () =>
      database
        .select({
          tenantId: tenants.id,
          slug: tenants.slug,
        })
        .from(tenants)
        .where(eq(tenants.slug, slug))
        .limit(1),
    {
      operation: "select",
      resource: "tenants",
      metadata: {
        host,
        slug,
      },
    }
  );

  return tenant ?? null;
};

const findActiveCompanyGrant = async ({
  tenantId,
  userId,
  companyId,
}: {
  tenantId: string;
  userId: string;
  companyId?: string | null;
}): Promise<ActiveCompanyGrant | null> => {
  const [grant] = await timeDatabaseQuery(
    () =>
      database
        .select({
          companyCode: companies.code,
          companyId: companyGrants.companyId,
          companyName: companies.name,
          grant: companyGrants.grant,
          grantId: companyGrants.id,
          tenantId: companyGrants.tenantId,
          userId: companyGrants.userId,
        })
        .from(companyGrants)
        .innerJoin(companies, eq(companies.id, companyGrants.companyId))
        .where(
          and(
            eq(companyGrants.tenantId, tenantId),
            eq(companyGrants.userId, userId),
            ...(companyId ? [eq(companyGrants.companyId, companyId)] : [])
          )
        )
        .orderBy(asc(companies.name), asc(companyGrants.createdAt))
        .limit(1),
    {
      operation: "select",
      resource: "company_grants",
      metadata: {
        companyId: companyId ?? null,
        tenantId,
        userId,
      },
    }
  );

  return grant ?? null;
};

export const getActiveTenantMembership =
  async (): Promise<ActiveTenantMembership | null> => {
    const user = await getUser();

    if (!user) {
      return null;
    }

    return findActiveTenantMembership(user.id);
  };

export const requireActiveTenantMembership =
  async (): Promise<ActiveTenantMembership> => {
    const user = await requireAuth();
    const membership = await findActiveTenantMembership(user.id);

    if (!membership) {
      throw new ForbiddenError(
        "An active tenant membership is required for this operation"
      );
    }

    return membership;
  };

export const requireActiveTenantAccess =
  async (): Promise<ActiveTenantAccess> => {
    const user = await requireAuth();
    const membership = await findActiveTenantMembership(user.id);

    if (!membership) {
      throw new ForbiddenError(
        "An active tenant membership is required for this operation"
      );
    }

    return {
      membership,
      user,
    };
  };

export const requireTenantAccess = async ({
  tenantId,
}: {
  tenantId: string;
}): Promise<ActiveTenantAccess> => {
  const user = await requireAuth();
  const membership = await findTenantMembership({
    tenantId,
    userId: user.id,
  });

  if (!membership) {
    throw new ForbiddenError(
      "Tenant membership is required for this operation"
    );
  }

  return {
    membership,
    user,
  };
};

export const getActiveCompanyGrant =
  async (): Promise<ActiveCompanyGrant | null> => {
    const access = await requireActiveTenantAccess();
    const cookieStore = await cookies();
    const activeCompanyId =
      cookieStore.get(ACTIVE_COMPANY_COOKIE_NAME)?.value ?? null;

    return findActiveCompanyGrant({
      tenantId: access.membership.tenantId,
      userId: access.user.id,
      companyId: activeCompanyId,
    });
  };

export const requireActiveCompanyGrant = async (
  companyId?: string | null
): Promise<ActiveCompanyGrant> => {
  const access = await requireActiveTenantAccess();
  const cookieStore = await cookies();
  const activeCompanyId =
    companyId ?? cookieStore.get(ACTIVE_COMPANY_COOKIE_NAME)?.value ?? null;
  const grant = await findActiveCompanyGrant({
    tenantId: access.membership.tenantId,
    userId: access.user.id,
    companyId: activeCompanyId,
  });

  if (!grant) {
    throw new ForbiddenError(
      "An active company grant is required for this operation"
    );
  }

  return grant;
};

export const requireActiveCompanyAccess =
  async (): Promise<ActiveCompanyAccess> => {
    const access = await requireActiveTenantAccess();
    const grant = await requireActiveCompanyGrant();

    return {
      company: grant,
      membership: access.membership,
      user: access.user,
    };
  };

export const requireCompanyAccess = async ({
  companyId,
  tenantId,
}: {
  companyId: string;
  tenantId: string;
}): Promise<ActiveCompanyAccess> => {
  const access = await requireTenantAccess({ tenantId });
  const grant = await findActiveCompanyGrant({
    companyId,
    tenantId,
    userId: access.user.id,
  });

  if (!grant) {
    throw new ForbiddenError("A company grant is required for this operation");
  }

  return {
    company: grant,
    membership: access.membership,
    user: access.user,
  };
};

export { resolveTenantSlugFromHost } from "./host.ts";
