export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "SERVICE_UNAVAILABLE";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    status = 400,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden"): AppError {
  return new AppError("FORBIDDEN", message, 403);
}

export function notFound(message = "Resource not found"): AppError {
  return new AppError("NOT_FOUND", message, 404);
}

export function conflict(message: string, details?: unknown): AppError {
  return new AppError("CONFLICT", message, 409, details);
}

export function validationError(message: string, details?: unknown): AppError {
  return new AppError("VALIDATION", message, 422, details);
}

export function toErrorResponse(error: unknown): {
  error: { code: string; message: string; details?: unknown };
  status: number;
} {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      status: error.status,
    };
  }

  console.error(error);
  return {
    error: { code: "INTERNAL", message: "An unexpected error occurred" },
    status: 500,
  };
}
