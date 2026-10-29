import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./config/swagger";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { securityMiddleware, dynamicRateLimiter } from "./middleware/gateway";

export const app = express();

// Trust reverse proxy headers (Render / AWS ALB) for accurate client IP identification
app.set("trust proxy", 1);

app.disable("x-powered-by");

// Apply Gateway Helmet Security
app.use(securityMiddleware);

// Global CORS Configuration
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));

// Parsing Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.text({ type: ["text/csv", "application/csv"], limit: "2mb" }));

// Expose Raw OpenAPI Spec
app.get("/docs/json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiSpec);
});

// Swagger UI Portal
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Tiered Rate Limiting applied directly to API Gateway endpoints
app.use("/api/", dynamicRateLimiter);

// Versioned Application Routes
app.use("/api/v1", apiRoutes);

// RFC 7807 404 Fallback Handler
app.use((req: Request, res: Response) => {
  res.status(404).type("application/problem+json").json({
    type: "https://scorekings-integration-kit.onrender.com/errors/not-found",
    title: "Not Found",
    status: 404,
    detail: "The requested API resource does not exist.",
    instance: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);