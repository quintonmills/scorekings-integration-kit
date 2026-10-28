import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ScoreKings Partner Integration API",
      version: "1.0.0",
      description: `
Partner API for legacy data migration and licensed league feeds.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/YOUR-POSTMAN-COLLECTION-LINK-HERE) [![Raw OpenAPI JSON](https://img.shields.io/badge/OpenAPI-3.0_JSON-blue?style=flat-square&logo=json)](/docs/json)
      `,
    },
    servers: [
      {
        url: "https://scorekings-integration-kit.onrender.com/api/v1",
        description: "Production Render Cloud Environment",
      },
      {
        url: "/api/v1",
        description: "Local / Relative Server",
      },
    ],
    components: {
      securitySchemes: {
        ScoreKingsApiKey: {
          type: "apiKey",
          in: "header",
          name: "X-ScoreKings-API-Key",
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../routes/*.{ts,js}")],
};

export const openApiSpec = swaggerJsdoc(options);