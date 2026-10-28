import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./config/swagger";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX) || 100;

app.disable("x-powered-by");

// Allow Swagger UI to load inline scripts & styles while maintaining Helmet security
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(
  rateLimit({
    windowMs: rateLimitWindowMs,
    limit: rateLimitMax,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.text({ type: ["text/csv", "application/csv"], limit: "2mb" }));

// Expose OpenAPI spec in raw JSON format
app.get("/docs/json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiSpec);
});

// Swagger UI mount
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/api/v1", apiRoutes);

// 404 RFC 7807 Fallback Handler
app.use((_req: Request, res: Response) => {
  res.status(404).type("application/problem+json").json({
    type: "about:blank",
    title: "Not Found",
    status: 404,
    detail: "The requested API resource does not exist.",
    instance: _req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);