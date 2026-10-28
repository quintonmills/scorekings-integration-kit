import { Router } from "express";
import { ingestMigration } from "../controllers/migrationController";
import { apiKeyAuth } from "../middleware/apiKeyAuth";

const router = Router();

/**
 * @openapi
 * /api/v1/migration/ingest:
 *   post:
 *     summary: Ingest and transform legacy sports or league data
 *     tags: [Migration]
 *     security:
 *       - ScoreKingsApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   records:
 *                     type: array
 *                     items:
 *                       type: object
 *               - type: array
 *                 items:
 *                   type: object
 *         text/csv:
 *           schema:
 *             type: string
 *             example: "legacy_id,league_name,season\\nL-01,Premier League,2025"
 *     responses:
 *       200:
 *         description: All records transformed and stored.
 *       207:
 *         description: Some records could not be transformed.
 *       401:
 *         description: Missing or invalid partner API key.
 *       422:
 *         description: No records could be transformed.
 */
router.post("/migration/ingest", apiKeyAuth, ingestMigration);

export default router;
