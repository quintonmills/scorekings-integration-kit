import { Types } from "mongoose";
import { LeagueData } from "../models/LeagueData";
import { MigrationLog } from "../models/MigrationLog";
import type {
  EntityType,
  MigrationResult,
  MigrationStatus,
  TransformedRecord
} from "../types";

type LegacyRecord = Record<string, unknown>;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

function getValue(record: LegacyRecord, aliases: string[]): unknown {
  const normalizedAliases = new Set(aliases.map(normalizeKey));
  const entry = Object.entries(record).find(([key, value]) => {
    return normalizedAliases.has(normalizeKey(key)) && value !== undefined && value !== null;
  });
  return entry?.[1];
}

function getText(record: LegacyRecord, aliases: string[]): string | undefined {
  const value = getValue(record, aliases);
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text.length > 0 ? text : undefined;
  }
  return undefined;
}

function getEntityType(record: LegacyRecord): EntityType {
  const declaredType = getText(record, ["entityType", "recordType", "type"])?.toLowerCase();
  if (declaredType) {
    if (["league", "team", "athlete", "player", "student", "game", "match"].includes(declaredType)) {
      if (declaredType === "player" || declaredType === "student") return "athlete";
      if (declaredType === "match") return "game";
      return declaredType as EntityType;
    }
    return "unknown";
  }

  if (getValue(record, ["athleteName", "playerName", "studentName"])) return "athlete";
  if (getValue(record, ["teamName"])) return "team";
  if (getValue(record, ["homeTeam", "awayTeam", "gameDate", "matchDate"])) return "game";
  if (getValue(record, ["leagueName", "leagueId"])) return "league";
  return "unknown";
}

function getRecordName(record: LegacyRecord, entityType: EntityType): string | undefined {
  const entityAliases: Record<EntityType, string[]> = {
    league: ["leagueName", "name", "title"],
    team: ["teamName", "name", "title"],
    athlete: ["athleteName", "playerName", "studentName", "name", "title"],
    game: ["gameName", "matchName", "name", "title"],
    unknown: ["name", "title", "leagueName", "teamName", "athleteName", "playerName"]
  };
  return getText(record, entityAliases[entityType]);
}

function transformRecord(value: unknown): TransformedRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Record must be a JSON object.");
  }
  const record = value as LegacyRecord;
  const entityType = getEntityType(record);
  const externalId = getText(record, ["externalId", "legacyId", "id", "uuid", "recordId"]);
  const name = getRecordName(record, entityType);

  if (!externalId) throw new Error("Record is missing an identifier (id, legacyId, or externalId).");
  if (!name) throw new Error("Record is missing a recognizable name.");

  const leagueName = getText(record, ["leagueName", "league"]);
  const season = getText(record, ["season", "seasonYear", "year"]);

  return {
    entityType,
    externalId,
    name,
    ...(leagueName ? { leagueName } : {}),
    ...(season ? { season } : {}),
    attributes: record
  };
}

function getRecords(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Payload must be an object or an array of records.");
  }

  const source = payload as LegacyRecord;
  const records = getValue(source, ["records", "data", "items"]);
  if (Array.isArray(records)) return records;
  return [source];
}

function makeStatus(transformedCount: number, errors: string[]): MigrationStatus {
  if (transformedCount === 0) return "FAILED";
  return errors.length > 0 ? "PARTIAL_SUCCESS" : "SUCCESS";
}

export async function migrateLegacyPayload(
  payload: unknown,
  partnerId: string,
  sourceFormat: "json" | "csv"
): Promise<MigrationResult> {
  const startedAt = Date.now();
  const errors: string[] = [];
  let records: unknown[];

  try {
    records = getRecords(payload);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Payload could not be read.");
    records = [];
  }

  const transformed = records.flatMap((record, index) => {
    try {
      return [transformRecord(record)];
    } catch (error) {
      errors.push(
        `Record ${index + 1}: ${error instanceof Error ? error.message : "Record could not be transformed."}`
      );
      return [];
    }
  });

  const migrationId = new Types.ObjectId();
  let status = makeStatus(transformed.length, errors);
  let persistedRecords: TransformedRecord[] = transformed;
  if (status !== "FAILED") {
    try {
      await LeagueData.insertMany(
        transformed.map((record) => ({ ...record, partnerId, migrationId }))
      );
    } catch (error) {
      errors.push("Transformed records could not be persisted.");
      status = "FAILED";
      persistedRecords = [];
      const durationMs = Date.now() - startedAt;
      try {
        await MigrationLog.create({
          _id: migrationId,
          partnerId,
          status,
          receivedCount: records.length,
          transformedCount: 0,
          durationMs,
          diagnostics: errors,
          sourceFormat
        });
      } catch (logError) {
        throw new AggregateError([error, logError], "Record persistence and migration logging both failed.");
      }
      return {
        migrationId: migrationId.toString(),
        status,
        receivedCount: records.length,
        transformedCount: 0,
        durationMs,
        errors
      };
    }
  }

  const durationMs = Date.now() - startedAt;
  await MigrationLog.create({
    _id: migrationId,
    partnerId,
    status,
    receivedCount: records.length,
    transformedCount: persistedRecords.length,
    durationMs,
    diagnostics: errors,
    sourceFormat
  });

  return {
    migrationId: migrationId.toString(),
    status,
    receivedCount: records.length,
    transformedCount: persistedRecords.length,
    durationMs,
    errors
  };
}
