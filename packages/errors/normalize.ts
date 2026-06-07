import { ZodError } from "zod";
import type { AppError } from "./core.js";
import { isAppError } from "./core.js";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError,
} from "./http.js";

type DatabaseErrorLike = Error & {
  code?: string;
  column?: string;
  constraint?: string;
  detail?: string;
  meta?: {
    target?: unknown;
  };
  table?: string;
};

const isDatabaseErrorLike = (error: unknown): error is DatabaseErrorLike =>
  error instanceof Error && "code" in error && typeof error.code === "string";

const getTargetFields = (target: unknown): string[] | undefined => {
  if (!Array.isArray(target)) {
    return;
  }

  return target.filter((value): value is string => typeof value === "string");
};

const normalizePrismaError = (
  error: DatabaseErrorLike
): ConflictError | NotFoundError | null => {
  if (error.code === "P2002") {
    return new ConflictError(
      "A record with the same unique value already exists",
      {
        fields: getTargetFields(error.meta?.target),
      }
    );
  }

  if (error.code === "P2025") {
    return new NotFoundError("Record");
  }

  return null;
};

const normalizePostgresError = (
  error: DatabaseErrorLike
): ConflictError | ValidationError | null => {
  if (error.code === "23505") {
    return new ConflictError(
      "A record with the same unique value already exists",
      {
        constraint: error.constraint,
        detail: error.detail,
        table: error.table,
      }
    );
  }

  if (error.code === "23503") {
    return new ConflictError("A related record is missing or still in use", {
      constraint: error.constraint,
      detail: error.detail,
      table: error.table,
    });
  }

  if (error.code === "22P02") {
    return new ValidationError(
      {
        _root: [error.detail ?? "One or more values are malformed"],
      },
      "The request payload is invalid"
    );
  }

  return null;
};

export const normalizeError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return ValidationError.fromZodError(error);
  }

  if (isDatabaseErrorLike(error)) {
    const prismaError = normalizePrismaError(error);

    if (prismaError) {
      return prismaError;
    }

    const postgresError = normalizePostgresError(error);

    if (postgresError) {
      return postgresError;
    }
  }

  if (error instanceof Error) {
    return new InternalError(undefined, error);
  }

  return new InternalError();
};
