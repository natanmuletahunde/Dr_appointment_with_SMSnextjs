import { describe, expect, it } from "vitest";
import {
  AppError,
  conflict,
  forbidden,
  notFound,
  toErrorResponse,
  unauthorized,
  validationError,
} from "@/lib/errors";

describe("errors", () => {
  it("builds typed AppErrors with status codes", () => {
    expect(unauthorized().status).toBe(401);
    expect(forbidden().status).toBe(403);
    expect(notFound().status).toBe(404);
    expect(conflict("dup").status).toBe(409);
    expect(validationError("bad").status).toBe(422);
  });

  it("maps AppError via toErrorResponse", () => {
    const err = new AppError("NOT_FOUND", "Missing", 404, { id: "x" });
    const res = toErrorResponse(err);
    expect(res.status).toBe(404);
    expect(res.error.code).toBe("NOT_FOUND");
    expect(res.error.message).toBe("Missing");
    expect(res.error.details).toEqual({ id: "x" });
  });

  it("maps unknown errors to INTERNAL 500", () => {
    const res = toErrorResponse(new Error("boom"));
    expect(res.status).toBe(500);
    expect(res.error.code).toBe("INTERNAL");
  });
});
