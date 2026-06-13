import {
  LOCAL_DEVELOPER_LOGIN,
  LOCAL_DEVELOPER_LOGIN_PROVISION_COMMAND,
} from "../../../../../lib/developer-login.constants.ts";
import type { ReactElement } from "react";

export function DeveloperLoginHint(): ReactElement {
  return (
    <aside
      aria-label="Local developer login"
      className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm"
    >
      <p className="font-medium text-amber-950 dark:text-amber-100">
        Local developer login
      </p>
      <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
        Provisioned through Supabase Auth for local development only. Grants
        owner access on the seeded <code className="text-xs">xforge</code>{" "}
        tenant.
      </p>
      <dl className="mt-3 space-y-2 font-mono text-xs">
        <div className="grid grid-cols-[4.5rem_1fr] gap-2">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{LOCAL_DEVELOPER_LOGIN.email}</dd>
        </div>
        <div className="grid grid-cols-[4.5rem_1fr] gap-2">
          <dt className="text-muted-foreground">Password</dt>
          <dd>{LOCAL_DEVELOPER_LOGIN.password}</dd>
        </div>
      </dl>
      <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
        Reset or recreate the account:
        <code className="mt-1 block rounded-md bg-muted px-2 py-1 text-[11px]">
          {LOCAL_DEVELOPER_LOGIN_PROVISION_COMMAND}
        </code>
      </p>
      <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
        Agents can manage Auth through Supabase MCP (
        <code className="text-xs">.cursor/mcp.json</code>
        ). Complete the browser OAuth flow once, then use development tools to
        inspect users and logs.
      </p>
    </aside>
  );
}
