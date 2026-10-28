import type { RequestHandler } from "express";
import { LeagueData } from "../models/LeagueData";
import { AppError } from "../middleware/errorHandler";
import type { EntityType } from "../types";

const entityTypes = new Set<EntityType>(["league", "team", "athlete", "game", "unknown"]);

function getPositiveInteger(value: unknown, fallback: number, maximum: number): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

export const getLicensedLeagues: RequestHandler = async (req, res, next) => {
  try {
    const partnerId = res.locals.partnerId;
    if (!partnerId) {
      throw new AppError(401, "Partner identity was not established.", "about:blank", "Unauthorized");
    }

    const page = getPositiveInteger(req.query.page, 1, Number.MAX_SAFE_INTEGER);
    const pageSize = getPositiveInteger(req.query.pageSize, 25, 100);
    const filter: Record<string, unknown> = {
      partnerId,
      entityType: "league"
    };

    if (typeof req.query.season === "string" && req.query.season.trim()) {
      filter.season = req.query.season.trim();
    }
    if (typeof req.query.entityType === "string") {
      if (!entityTypes.has(req.query.entityType as EntityType)) {
        throw new AppError(400, "entityType must be league, team, athlete, game, or unknown.", "about:blank", "Bad Request");
      }
      filter.entityType = req.query.entityType;
    }

    const [items, total] = await Promise.all([
      LeagueData.find(filter)
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      LeagueData.countDocuments(filter)
    ]);

    res.status(200).json({
      data: items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};
