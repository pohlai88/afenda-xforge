import {
  bootstrapModuleConsoleRegistry,
  listModuleConsoleOperatorAssignmentsForSystemAdmin,
  listRegisteredModuleConsolesForSystemAdmin,
} from "@repo/features-system-admin-control-plane/server";
import { hrConsoleModuleRegistration } from "@repo/features-hr-suite-hr-console/manifest";
import { ForbiddenError } from "@repo/errors";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import Link from "next/link";
import type { ReactElement } from "react";
import { ModuleConsoleOperatorActions } from "./_components/module-console-operator-actions.tsx";
import { StatusBadge } from "../../_components/status-badge.tsx";
import {
  createRuntimePermissionContext,
  resolveRuntimeTenantAccess,
} from "../../../_runtime-access.ts";

bootstrapModuleConsoleRegistry([hrConsoleModuleRegistration]);

export default async function SystemAdminModuleConsolesPage(): Promise<ReactElement> {
  try {
    const access = await resolveRuntimeTenantAccess();

    requirePermission(
      createRuntimePermissionContext(
        access,
        "system-admin.module-consoles.read",
        "system-admin.module-consoles"
      ),
      {
        allOf: [permissionCatalog.systemAdmin.moduleConsolesRead],
      }
    );

    const scope = {
      grantedPermissions: access.grantedPermissions,
      tenantId: access.tenantId,
      userId: access.actorId,
    };

    if (!process.env.DATABASE_URL) {
      process.env.AFENDA_MODULE_CONSOLE_REPOSITORY_MODE = "file";
    }

    const consoles = listRegisteredModuleConsolesForSystemAdmin(scope);
    const assignments = await listModuleConsoleOperatorAssignmentsForSystemAdmin(
      { consoleId: "hr.console" },
      scope
    );
    const canAssign = access.grantedPermissions.includes(
      permissionCatalog.systemAdmin.moduleConsolesAssign
    );

    return (
      <section className="space-y-8">
        <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
              System Admin
            </p>
            <h1 className="font-semibold text-4xl tracking-tight">
              Module Consoles
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Register module consoles and assign console operators. Operator
              assignment APIs remain System Admin exclusive.
            </p>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {consoles.map((console) => (
            <article
              className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm"
              key={console.consoleId}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-xl tracking-tight">
                  {console.title}
                </h2>
                <StatusBadge
                  tone={console.status === "ready" ? "success" : "warning"}
                >
                  {console.status}
                </StatusBadge>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">
                {console.appBasePath} · {console.suite}
              </p>
              <Link
                className="mt-4 inline-flex text-primary text-sm hover:underline"
                href={console.appBasePath}
              >
                Open console
              </Link>
            </article>
          ))}
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
          <h2 className="font-semibold text-2xl tracking-tight">
            HR console operators
          </h2>
          {assignments.length === 0 ? (
            <p className="mt-4 text-muted-foreground text-sm">
              No active HR console operators. System Admin operates under SME
              fallback policy until an operator is assigned.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {assignments.map((assignment) => (
                <li
                  className="rounded-lg border border-border/70 bg-background/80 p-4"
                  key={assignment.id}
                >
                  <p className="font-medium text-sm">
                    Operator {assignment.operatorUserId}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Company {assignment.companyId} · Assignment {assignment.id}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <ModuleConsoleOperatorActions
            canAssign={canAssign}
            consoleId="hr.console"
            defaultCompanyId={assignments[0]?.companyId}
          />
        </section>
      </section>
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
          <h1 className="font-semibold text-3xl tracking-tight">
            Module consoles unavailable
          </h1>
          <p className="mt-2 text-muted-foreground">
            Requires system-admin.module-consoles.read.
          </p>
        </section>
      );
    }

    throw error;
  }
}
