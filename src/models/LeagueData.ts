import { model, Schema, Types } from "mongoose";
import type { EntityType } from "../types";

export interface LeagueDataDocument {
  partnerId: string;
  migrationId: Types.ObjectId;
  entityType: EntityType;
  externalId: string;
  name: string;
  leagueName?: string;
  season?: string;
  attributes: Record<string, unknown>;
}

const leagueDataSchema = new Schema<LeagueDataDocument>(
  {
    partnerId: { type: String, required: true, index: true },
    migrationId: { type: Schema.Types.ObjectId, required: true, index: true },
    entityType: {
      type: String,
      enum: ["league", "team", "athlete", "game", "unknown"],
      required: true,
      index: true
    },
    externalId: { type: String, required: true },
    name: { type: String, required: true },
    leagueName: { type: String },
    season: { type: String, index: true },
    attributes: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

leagueDataSchema.index({ partnerId: 1, entityType: 1, externalId: 1 });

export const LeagueData = model<LeagueDataDocument>("LeagueData", leagueDataSchema);
