import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Configure Helmet for Security Headers (bypasses Swagger inline assets safely)
export const securityMiddleware = helmet({
  contentSecurityPolicy: false, // Disables default CSP to allow Swagger UI inline styles/badges
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Tier Configurations (Requests per 15-minute window)
const TIER_LIMITS = {
  FREE: 60,         // Standard unauthenticated or trial access
  PARTNER: 1000,    // Authenticated B2B tier
};

/**
 * Dynamic Rate Limiter Middleware
 * Key generator prioritizes API keys; falls back to client IP address.
 */
export const dynamicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: (req: Request) => {
    const apiKey = req.header("X-ScoreKings-API-Key");
    
    // Enterprise Partner Tier
    if (apiKey && apiKey === process.env.SCOREKINGS_API_KEY) {
      return TIER_LIMITS.PARTNER;
    }
    
    // Default Free Tier
    return TIER_LIMITS.FREE;
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    const apiKey = req.header("X-ScoreKings-API-Key");
    const isPartner = apiKey && apiKey === process.env.SCOREKINGS_API_KEY;
    const limit = isPartner ? TIER_LIMITS.PARTNER : TIER_LIMITS.FREE;

    // RFC 7807 Compliant Payload for Rate Limit Errors
    res.status(429).json({
      type: "https://scorekings-integration-kit.onrender.com/errors/rate-limit-exceeded",
      title: "Too Many Requests",
      status: 429,
      detail: `Rate limit of ${limit} requests per 15 minutes exceeded for your tier.`,
      instance: req.originalUrl,
    });
  },
});