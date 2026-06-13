import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  LOCAL_DEVELOPER_LOGIN,
  LOCAL_DEVELOPER_LOGIN_PROVISION_COMMAND,
} from "../lib/developer-login.constants.ts";

const loadEnvFile = (filePath: string): Record<string, string> => {
  const values: Record<string, string> = {};

  try {
    const content = readFileSync(filePath, "utf8");

    for (const line of content.split(/\r?\n/u)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      values[key] = value;
    }
  } catch {
    return values;
  }

  return values;
};

const mergeEnv = (...files: string[]): Record<string, string> =>
  files.reduce<Record<string, string>>((merged, file) => {
    return { ...merged, ...loadEnvFile(file) };
  }, {});

const root = resolve(import.meta.dirname, "../../..");
const env = mergeEnv(
  resolve(root, ".env.local"),
  resolve(root, "apps/app/.env.local"),
  resolve(root, "apps/app/.env")
);

const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/u, "");
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const { email, password } = LOCAL_DEVELOPER_LOGIN;

if (!(url && serviceRoleKey)) {
  console.error(
    JSON.stringify({
      ok: false,
      reason: "missing_supabase_config",
      hint: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    })
  );
  process.exit(1);
}

const adminHeaders = {
  Authorization: `Bearer ${serviceRoleKey}`,
  apikey: serviceRoleKey,
  "content-type": "application/json",
};

const listUsersResponse = await fetch(
  `${url}/auth/v1/admin/users?page=1&per_page=200`,
  { headers: adminHeaders }
);

if (!listUsersResponse.ok) {
  console.error(
    JSON.stringify({
      ok: false,
      reason: "list_users_failed",
      status: listUsersResponse.status,
      message: await listUsersResponse.text(),
    })
  );
  process.exit(1);
}

const listPayload = (await listUsersResponse.json()) as {
  users?: Array<{ email?: string; id: string }>;
};

const existingUser = listPayload.users?.find(
  (user) => user.email?.toLowerCase() === email.toLowerCase()
);

let userId = existingUser?.id;

if (!userId) {
  const createResponse = await fetch(`${url}/auth/v1/admin/users`, {
    body: JSON.stringify({
      email,
      email_confirm: true,
      password,
    }),
    headers: adminHeaders,
    method: "POST",
  });

  if (!createResponse.ok) {
    console.error(
      JSON.stringify({
        ok: false,
        reason: "create_user_failed",
        status: createResponse.status,
        message: await createResponse.text(),
      })
    );
    process.exit(1);
  }

  const createPayload = (await createResponse.json()) as { id?: string };
  userId = createPayload.id;
} else {
  const updateResponse = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    body: JSON.stringify({
      email_confirm: true,
      password,
    }),
    headers: adminHeaders,
    method: "PUT",
  });

  if (!updateResponse.ok) {
    console.error(
      JSON.stringify({
        ok: false,
        reason: "update_user_failed",
        status: updateResponse.status,
        message: await updateResponse.text(),
      })
    );
    process.exit(1);
  }
}

if (!userId) {
  console.error(JSON.stringify({ ok: false, reason: "missing_user_id" }));
  process.exit(1);
}

const grantResult = spawnSync(
  "pnpm",
  [
    "--filter",
    "@repo/database",
    "exec",
    "tsx",
    "scripts/grant-smoke-user.mts",
    userId,
  ],
  {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      ...env,
      XFORGE_DEMO_USER_ID: userId,
    },
    shell: true,
  }
);

if (grantResult.status !== 0) {
  console.error(
    JSON.stringify({
      ok: false,
      reason: "grant_failed",
      stderr: grantResult.stderr,
      stdout: grantResult.stdout,
    })
  );
  process.exit(1);
}

console.log(
  [
    "Developer login ready.",
    `Email: ${email}`,
    `Password: ${password}`,
    `User ID: ${userId}`,
    `Reset anytime: ${LOCAL_DEVELOPER_LOGIN_PROVISION_COMMAND}`,
    "Supabase MCP: authenticate Cursor against https://mcp.supabase.com/mcp (see skills/reference/setup.md).",
  ].join("\n")
);
