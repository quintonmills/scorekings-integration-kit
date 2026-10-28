import type { RequestHandler } from "express";
import { parse } from "csv-parse/sync";
import { AppError } from "../middleware/errorHandler";
import { migrateLegacyPayload } from "../services/migrationService";

export const ingestMigration: RequestHandler = async (req, res, next) => {
  try {
    const partnerId = res.locals.partnerId;
    if (!partnerId) {
      throw new AppError(401, "Partner identity was not established.", "about:blank", "Unauthorized");
    }

    let payload: unknown;
    let sourceFormat: "json" | "csv";
    if (typeof req.body === "string") {
      sourceFormat = "csv";
      try {
        payload = parse(req.body, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true
        });
      } catch (error) {
        throw new AppError(
          400,
          error instanceof Error ? `Invalid CSV: ${error.message}` : "Invalid CSV payload.",
          "about:blank",
          "Bad Request"
        );
      }
    } else {
      payload = req.body;
      sourceFormat = "json";
    }

    const result = await migrateLegacyPayload(payload, partnerId, sourceFormat);
    const statusCode = result.status === "FAILED" ? 422 : result.status === "PARTIAL_SUCCESS" ? 207 : 200;
    res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
