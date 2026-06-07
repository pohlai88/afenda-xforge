export type ErrorDetails = Record<string, unknown>;

export type AppErrorOptions = {
  cause?: unknown;
  details?: ErrorDetails;
  isOperational?: boolean;
};

export type SerializedAppError = {
  code: string;
  message: string;
  statusCode: number;
  details?: ErrorDetails;
  requestId?: string;
  timestamp: string;
};

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  readonly details?: ErrorDetails;
  readonly isOperational: boolean;
  readonly timestamp: Date;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);

    this.name = new.target.name;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    this.timestamp = new Date();

    if (options.cause !== undefined) {
      Object.defineProperty(this, "cause", {
        configurable: true,
        enumerable: false,
        value: options.cause,
        writable: true,
      });
    }

    Error.captureStackTrace?.(this, new.target);
  }

  toJSON(requestId?: string): SerializedAppError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      requestId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;

export const isOperationalError = (error: unknown): boolean =>
  isAppError(error) ? error.isOperational : false;

export const getErrorMessage = (
  error: unknown,
  fallback = "An error occurred"
): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return fallback;
};
