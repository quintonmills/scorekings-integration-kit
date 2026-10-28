import type { ErrorRequestHandler } from "express";
import type { ProblemDetails } from "../types";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly type = "about:blank",
    public readonly title = "Request failed"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  const appError = error instanceof AppError ? error : undefined;
  const isJsonParseError =
    error instanceof SyntaxError && Object.prototype.hasOwnProperty.call(error, "body");
  const status = appError?.status ?? (isJsonParseError ? 400 : 500);
  const details: ProblemDetails = {
    type: appError?.type ?? "about:blank",
    title: appError?.title ?? (isJsonParseError ? "Bad Request" : "Internal Server Error"),
    status,
    detail: appError?.message ?? (isJsonParseError ? "The request body contains invalid JSON." : "An unexpected error occurred."),
    instance: req.originalUrl,
    timestamp: new Date().toISOString()
  };

  if (!appError) {
    console.error("Unhandled API error", error);
  }

  res.status(status).type("application/problem+json").json(details);
};
