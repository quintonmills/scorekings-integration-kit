import { Router } from "express";
import { getLicensedLeagues } from "../controllers/licensingController";
import { apiKeyAuth } from "../middleware/apiKeyAuth";

const router = Router();

/**
 * @openapi
 * /api/v1/licensing/leagues:
 *   get:
 *     summary: Get paginated licensed league data
 *     tags: [Licensing]
 *     security:
 *       - ScoreKingsApiKey: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [league, team, athlete, game, unknown]
 *     responses:
 *       200:
 *         description: Partner's licensed data and pagination metadata.
 *       401:
 *         description: Missing or invalid partner API key.
 */
router.get("/licensing/leagues", apiKeyAuth, getLicensedLeagues);

export default router;
