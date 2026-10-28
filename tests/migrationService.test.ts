import { LeagueData } from "../src/models/LeagueData";
import { MigrationLog } from "../src/models/MigrationLog";
import { migrateLegacyPayload } from "../src/services/migrationService";

describe("migrateLegacyPayload", () => {
  beforeEach(() => {
    jest.spyOn(LeagueData, "insertMany").mockImplementation(async () => [] as never);
    jest.spyOn(MigrationLog, "create").mockImplementation(async () => ({}) as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("normalizes legacy league aliases and writes a successful audit log", async () => {
    const result = await migrateLegacyPayload(
      { records: [{ legacy_id: "L-1", league_name: "Premier League", season_year: 2025 }] },
      "partner-1",
      "json"
    );

    expect(result).toMatchObject({
      status: "SUCCESS",
      receivedCount: 1,
      transformedCount: 1,
      errors: []
    });
    expect(LeagueData.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          partnerId: "partner-1",
          externalId: "L-1",
          name: "Premier League",
          entityType: "league",
          season: "2025"
        })
      ])
    );
    expect(MigrationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "SUCCESS",
        receivedCount: 1,
        transformedCount: 1,
        sourceFormat: "json"
      })
    );
  });

  it("returns partial success when individual records are invalid", async () => {
    const result = await migrateLegacyPayload(
      [
        { id: "L-1", leagueName: "Premier League" },
        { leagueName: "Missing ID" }
      ],
      "partner-1",
      "csv"
    );

    expect(result.status).toBe("PARTIAL_SUCCESS");
    expect(result.receivedCount).toBe(2);
    expect(result.transformedCount).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(MigrationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "PARTIAL_SUCCESS", sourceFormat: "csv" })
    );
  });

  it("logs failed payloads without attempting record persistence", async () => {
    const result = await migrateLegacyPayload("not-a-record-object", "partner-1", "json");

    expect(result.status).toBe("FAILED");
    expect(result.transformedCount).toBe(0);
    expect(LeagueData.insertMany).not.toHaveBeenCalled();
    expect(MigrationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILED", transformedCount: 0 })
    );
  });
});
