# Partner Migration Guide

This guide describes the technical discovery and data-flow steps for migrating legacy sports and league data into the ScoreKings partner API.

## 1. Integration discovery

Before transforming data, the partner and ScoreKings integration teams should confirm:

1. **Source inventory:** systems of record, export formats, record volumes, update cadence, and data owners.
2. **Entity definitions:** league, team, athlete/player/student, and game/match identifiers and relationships.
3. **Field semantics:** date/time zones, season conventions, status codes, units, localization, and null/empty-value meanings.
4. **Licensing boundaries:** the partner's licensed competitions, regions, entities, retention requirements, and permitted use.
5. **Operational expectations:** throughput, pagination, retry policy, maintenance windows, and escalation contacts.
6. **Security requirements:** partner identity, API-key ownership and rotation, network restrictions, and credential-handling policy.

Exchange representative, de-identified sample exports and a field dictionary before production credentials or bulk data are used.

## 2. Data flow

```text
Legacy CSV / JSON export
        -> partner POST /api/v1/migration/ingest
        -> payload parsing and canonical field mapping
        -> record validation and per-record diagnostics
        -> normalized LeagueData documents + MigrationLog audit entry
        -> partner GET /api/v1/licensing/leagues
```

Use `Content-Type: application/json` for JSON or `Content-Type: text/csv` for CSV. CSV files must have a header row. The service accepts a JSON array, an object containing `records`, `data`, or `items`, or a single JSON record.

## 3. Legacy-to-SaaS mapping

| Canonical field | Accepted legacy examples | Notes |
|---|---|---|
| `externalId` | `externalId`, `legacyId`, `id`, `uuid`, `recordId` | Required; retain the source identifier for reconciliation. |
| `name` | `leagueName`, `teamName`, `athleteName`, `playerName`, `studentName`, `gameName`, `name`, `title` | Required; entity-specific aliases are preferred. |
| `entityType` | `entityType`, `recordType`, `type` | Optional; maps `player`/`student` to `athlete`, and `match` to `game`. |
| `leagueName` | `leagueName`, `league` | Optional competition context. |
| `season` | `season`, `seasonYear`, `year` | Optional; agree on canonical season format with ScoreKings. |
| `attributes` | Remaining source record | Retained as source attributes to support reconciliation. |

Entity type can be inferred from `athleteName`/`playerName`/`studentName`, `teamName`, `homeTeam`/`awayTeam`, or league fields. When it cannot be identified, the record is retained as `unknown` and should be reviewed during migration validation.

## 4. Authentication and request examples

Send credentials using `X-ScoreKings-API-Key`. For local development, set `SCOREKINGS_API_KEY` in `.env`; production partner keys should be provisioned and stored as SHA-256 hashes in the `PartnerKey` collection. Never place production keys in source control, sample files, or logs.

JSON:

```sh
curl -X POST http://localhost:3000/api/v1/migration/ingest \
  -H 'Content-Type: application/json' \
  -H 'X-ScoreKings-API-Key: YOUR_PARTNER_KEY' \
  -d '{"records":[{"legacy_id":"L-100","league_name":"Premier League","season":"2025"}]}'
```

CSV:

```sh
curl -X POST http://localhost:3000/api/v1/migration/ingest \
  -H 'Content-Type: text/csv' \
  -H 'X-ScoreKings-API-Key: YOUR_PARTNER_KEY' \
  --data-binary $'legacy_id,league_name,season\nL-100,Premier League,2025'
```

Fetch the licensed feed using `page`, `pageSize` (maximum 100), `season`, and optionally `entityType`:

```sh
curl 'http://localhost:3000/api/v1/licensing/leagues?page=1&pageSize=25&season=2025' \
  -H 'X-ScoreKings-API-Key: YOUR_PARTNER_KEY'
```

## 5. Migration verification and operations

Each ingest response reports a `migrationId`, `status`, received and transformed counts, execution latency, and record-level errors. Status is `SUCCESS`, `PARTIAL_SUCCESS`, or `FAILED`. Corresponding audit records are written to `MigrationLog`; successfully transformed records are stored in `LeagueData`.

Recommended partner validation:

1. Start with a small, representative sample and reconcile input versus transformed counts.
2. Confirm field mappings and entity classification with the source-system owner.
3. Verify output using the licensing endpoint and compare IDs, names, seasons, and expected access scope.
4. Correct rejected records, then retry only the records that are safe to replay. Coordinate duplicate/replay expectations before large or recurring imports.
5. Monitor status, latency, pagination, and 4xx/5xx rates during cutover. Use the `instance` and `timestamp` in RFC 7807 problem responses when escalating.

The starter kit preserves source attributes for discovery and reconciliation; production deployments should review retention, privacy, indexing, idempotency, and licensing controls against the partner agreement before onboarding.
