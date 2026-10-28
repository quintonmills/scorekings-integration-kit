import { createHash, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { PartnerKey } from "../models/PartnerKey";
import { AppError } from "./errorHandler";

function isEqualSecret(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

export const apiKeyAuth: RequestHandler = async (req, res, next) => {
  try {
    const apiKey = req.header("X-ScoreKings-API-Key");
    if (!apiKey) {
      throw new AppError(401, "Provide the X-ScoreKings-API-Key header.", "about:blank", "Unauthorized");
    }

    const configuredKey = process.env.SCOREKINGS_API_KEY;
    if (configuredKey && isEqualSecret(apiKey, configuredKey)) {
      res.locals.partnerId = process.env.SCOREKINGS_DEMO_PARTNER_ID ?? "demo-partner";
      next();
      return;
    }

    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const partnerKey = await PartnerKey.findOne({ keyHash, enabled: true }).select("partnerId");
    if (!partnerKey) {
      throw new AppError(401, "The supplied API key is invalid or disabled.", "about:blank", "Unauthorized");
    }

    res.locals.partnerId = partnerKey.partnerId;
    next();
  } catch (error) {
    next(error);
  }
};
