import { Router } from "express";
import healthRoutes from "./healthRoutes";
import licensingRoutes from "./licensingRoutes";
import migrationRoutes from "./migrationRoutes";

const router = Router();

router.use(healthRoutes);
router.use(migrationRoutes);
router.use(licensingRoutes);

export default router;
