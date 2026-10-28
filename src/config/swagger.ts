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

<div style="display: flex; align-items: center; gap: 12px; margin-top: 12px; margin-bottom: 8px;">
  <!-- Official Postman Run Button -->
  <a href="https://app.getpostman.com/run-collection/YOUR-POSTMAN-COLLECTION-LINK-HERE" target="_blank" rel="noopener noreferrer">
    <img src="https://run.pstmn.io/button.svg" alt="Run in Postman" style="height: 32px; width: 128px;" />
  </a>
  
  <!-- Companion Raw JSON Button -->
  <a href="/docs/json" target="_blank" rel="noopener noreferrer" style="font-family: sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; color: #3b4151; background: #f8f9fa; padding: 6px 12px; border: 1px solid #ced4da; border-radius: 4px; display: inline-block;">
    📄 View Raw OpenAPI JSON
  </a>
</div>
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