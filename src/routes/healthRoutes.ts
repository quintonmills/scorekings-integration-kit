import { Router } from "express";
import { getHealth } from "../controllers/healthController";

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Get system and API health
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is available.
 */
router.get("/health", getHealth);

export default router;
