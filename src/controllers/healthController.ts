import type { RequestHandler } from "express";

export const getHealth: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "scorekings-integration-kit",
    apiVersion: "v1",
    timestamp: new Date().toISOString()
  });
};
