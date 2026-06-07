import {
  createDatabaseCheck,
  createHealthManager,
  createMemoryCheck,
  createRedisCheck,
} from "@repo/health";

const version: string =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  process.env.npm_package_version ??
  "0.1.0";

export const healthManager = createHealthManager({
  service: "app",
  version,
  checks: [createDatabaseCheck(), createRedisCheck(), createMemoryCheck()],
});

healthManager.markReady();
