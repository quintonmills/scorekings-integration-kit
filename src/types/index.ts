export type MigrationStatus = "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";

export type EntityType = "league" | "team" | "athlete" | "game" | "unknown";

export interface TransformedRecord {
  entityType: EntityType;
  externalId: string;
  name: string;
  leagueName?: string;
  season?: string;
  attributes: Record<string, unknown>;
}

export interface MigrationResult {
  migrationId: string;
  status: MigrationStatus;
  receivedCount: number;
  transformedCount: number;
  durationMs: number;
  errors: string[];
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
}
