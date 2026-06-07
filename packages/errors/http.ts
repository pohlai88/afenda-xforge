import type { ZodError } from "zod";
import type { AppErrorOptions } from "./core.ts";
import { AppError } from "./core.ts";

export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;

  constructor(
    resource: string,
    identifier?: string,
    options?: AppErrorOptions
  ) {
    const message = identifier
      ? `${resource} "${identifier}" was not found`
      : `${resource} was not found`;

    super(message, {
      ...options,
      details: {
        resource,
        identifier,
        ...options?.details,
      },
    });
  }
}

export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 422;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    fieldErrors: Record<string, string[]>,
    message = "The request payload is invalid",
    options?: AppErrorOptions
  ) {
    super(message, {
      ...options,
      details: {
        fields: fieldErrors,
        ...options?.details,
      },
    });

    this.fieldErrors = fieldErrors;
  }

  static fromZodError(zodError: ZodError<unknown>): ValidationError {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of zodError.issues) {
      const path = issue.path.join(".") || "_root";
      fieldErrors[path] ??= [];
      fieldErrors[path].push(issue.message);
    }

    return new ValidationError(fieldErrors);
  }
}

export class ConflictError extends AppError {
  readonly code = "CONFLICT";
  readonly statusCode = 409;

  constructor(message: string, details?: AppErrorOptions["details"]) {
    super(message, { details });
  }
}

export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;

  constructor(message = "Authentication is required") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";
  readonly statusCode = 403;

  constructor(message = "You do not have permission to perform this action") {
    super(message);
  }
}

export class RateLimitError extends AppError {
  readonly code = "RATE_LIMITED";
  readonly statusCode = 429;
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, options?: AppErrorOptions) {
    super(
      `Too many requests. Retry in ${Math.max(0, retryAfterSeconds)} seconds`,
      {
        ...options,
        details: {
          retryAfterSeconds,
          ...options?.details,
        },
      }
    );

    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class InternalError extends AppError {
  readonly code = "INTERNAL_ERROR";
  readonly statusCode = 500;

  constructor(
    message = "An internal error occurred. Please try again later.",
    cause?: unknown
  ) {
    super(message, {
      cause,
      isOperational: false,
    });
  }
}

export class ServiceUnavailableError extends AppError {
  readonly code = "SERVICE_UNAVAILABLE";
  readonly statusCode = 503;

  constructor(service: string, details?: AppErrorOptions["details"]) {
    super(`${service} is temporarily unavailable`, {
      details: {
        service,
        ...details,
      },
    });
  }
}

export class ConfigurationError extends AppError {
  readonly code = "CONFIGURATION_ERROR";
  readonly statusCode = 500;

  constructor(message: string, details?: AppErrorOptions["details"]) {
    super(message, {
      details,
      isOperational: false,
    });
  }
}

export class BusinessRuleError extends AppError {
  readonly code = "BUSINESS_RULE_VIOLATION";
  readonly statusCode = 422;

  constructor(message: string, details?: AppErrorOptions["details"]) {
    super(message, { details });
  }
}

export class ResourceStateError extends AppError {
  readonly code = "INVALID_RESOURCE_STATE";
  readonly statusCode = 422;

  constructor(resource: string, fromState: string, toState?: string) {
    const message = toState
      ? `${resource} cannot transition from "${fromState}" to "${toState}"`
      : `${resource} is in an invalid state: "${fromState}"`;

    super(message, {
      details: {
        resource,
        fromState,
        toState,
      },
    });
  }
}

export class PlanLimitError extends AppError {
  readonly code = "PLAN_LIMIT_EXCEEDED";
  readonly statusCode = 403;

  constructor(
    metric: string,
    limit: number,
    current: number,
    suggestedPlan?: string
  ) {
    super(`Plan limit exceeded for ${metric} (${current}/${limit})`, {
      details: {
        current,
        limit,
        metric,
        suggestedPlan,
      },
    });
  }
}

export class FeatureNotAvailableError extends AppError {
  readonly code = "FEATURE_NOT_AVAILABLE";
  readonly statusCode = 403;

  constructor(feature: string, requirement?: string) {
    super(
      requirement
        ? `${feature} requires ${requirement}`
        : `${feature} is not available`,
      {
        details: {
          feature,
          requirement,
        },
      }
    );
  }
}
