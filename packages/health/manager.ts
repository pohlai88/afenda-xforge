import "server-only";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export type HealthCheckResult = {
  healthy: boolean;
  message?: string;
  details?: Record<string, unknown>;
};

export type DependencyHealth = {
  name: string;
  status: HealthStatus;
  responseTimeMs: number;
  critical: boolean;
  message?: string;
  details?: Record<string, unknown>;
};

export type HealthReport = {
  status: HealthStatus;
  service: string;
  version: string;
  ready: boolean;
  uptimeSeconds: number;
  timestamp: string;
  dependencies: DependencyHealth[];
  system: {
    arch: NodeJS.Architecture;
    cpuUsageMicros: {
      system: number;
      user: number;
    };
    nodeVersion: string;
    memoryUsageMb: {
      external: number;
      heapTotal: number;
      heapUsed: number;
      rss: number;
    };
    pid: number;
    platform: NodeJS.Platform;
  };
};

export type HealthCheck = {
  name: string;
  check: () => Promise<HealthCheckResult>;
  critical?: boolean;
  timeoutMs?: number;
};

export type HealthManagerConfig = {
  service: string;
  version: string;
  checks: HealthCheck[];
  startedAt?: Date;
};

export type ProbeResult = {
  status: "ok" | "error";
  message?: string;
  checks?: DependencyHealth[];
};

export type VersionInfo = {
  service: string;
  version: string;
  nodeVersion: string;
  environment: string;
  startedAt: string;
  ready: boolean;
  commitSha?: string;
  deploymentId?: string;
};

const createTimeoutError = (name: string, timeoutMs: number): Error =>
  new Error(`Health check "${name}" timed out after ${timeoutMs}ms`);

export class HealthManager {
  readonly config: HealthManagerConfig;
  readonly startedAt: Date;

  private ready = false;

  constructor(config: HealthManagerConfig) {
    this.config = config;
    this.startedAt = config.startedAt ?? new Date();
  }

  markReady(): void {
    this.ready = true;
  }

  markNotReady(): void {
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }

  async getHealthReport(): Promise<HealthReport> {
    const dependencies = await this.runChecks(this.config.checks);
    const hasCriticalFailure = dependencies.some(
      (dependency) => dependency.critical && dependency.status === "unhealthy"
    );
    const hasNonHealthyDependency = dependencies.some(
      (dependency) => dependency.status !== "healthy"
    );
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    let status: HealthStatus = "healthy";

    if (hasCriticalFailure) {
      status = "unhealthy";
    } else if (hasNonHealthyDependency) {
      status = "degraded";
    }

    return {
      status,
      service: this.config.service,
      version: this.config.version,
      ready: this.ready,
      uptimeSeconds: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
      timestamp: new Date().toISOString(),
      dependencies,
      system: {
        arch: process.arch,
        cpuUsageMicros: {
          system: cpuUsage.system,
          user: cpuUsage.user,
        },
        nodeVersion: process.version,
        memoryUsageMb: {
          external: Math.round(memoryUsage.external / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
        pid: process.pid,
        platform: process.platform,
      },
    };
  }

  getLiveness(): Promise<ProbeResult> {
    return Promise.resolve({ status: "ok" });
  }

  async getReadiness(): Promise<ProbeResult> {
    if (!this.ready) {
      return {
        status: "error",
        message: "Service is not ready yet",
        checks: [],
      };
    }

    const criticalChecks = this.config.checks.filter(
      (check) => check.critical !== false
    );
    const checks = await this.runChecks(criticalChecks);
    const healthy = checks.every((check) => check.status === "healthy");

    return {
      status: healthy ? "ok" : "error",
      message: healthy
        ? undefined
        : "One or more critical dependencies are unavailable",
      checks,
    };
  }

  getStartup(): Promise<ProbeResult> {
    return Promise.resolve({
      status: this.ready ? "ok" : "error",
      message: this.ready ? undefined : "Service startup is still in progress",
    });
  }

  getVersion(): VersionInfo {
    return {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
      deploymentId:
        process.env.VERCEL_DEPLOYMENT_ID ??
        process.env.VERCEL_PROJECT_PRODUCTION_URL,
      environment: process.env.NODE_ENV ?? "development",
      ready: this.ready,
      service: this.config.service,
      startedAt: this.startedAt.toISOString(),
      version: this.config.version,
      nodeVersion: process.version,
    };
  }

  private runChecks(
    checks: readonly HealthCheck[]
  ): Promise<DependencyHealth[]> {
    return Promise.all(
      checks.map(async (check): Promise<DependencyHealth> => {
        const timeoutMs = check.timeoutMs ?? 5000;
        const start = Date.now();

        try {
          const result = await Promise.race([
            check.check(),
            new Promise<never>((_, reject) => {
              setTimeout(
                () => reject(createTimeoutError(check.name, timeoutMs)),
                timeoutMs
              );
            }),
          ]);

          return {
            name: check.name,
            status: result.healthy ? "healthy" : "unhealthy",
            responseTimeMs: Date.now() - start,
            critical: check.critical !== false,
            message: result.message,
            details: result.details,
          };
        } catch (error) {
          return {
            name: check.name,
            status: "unhealthy",
            responseTimeMs: Date.now() - start,
            critical: check.critical !== false,
            message:
              error instanceof Error
                ? error.message
                : "Unknown health check error",
          };
        }
      })
    );
  }
}

export const createHealthManager = (
  config: HealthManagerConfig
): HealthManager => new HealthManager(config);
