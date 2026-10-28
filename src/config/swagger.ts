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

<div style="display: flex; align-items: center; gap: 10px; margin-top: 14px; margin-bottom: 10px;">
  <!-- Official Postman Run Button -->
  <a href="https://app.getpostman.com/run-collection/YOUR-POSTMAN-COLLECTION-LINK-HERE" target="_blank" rel="noopener noreferrer">
    <img src="https://run.pstmn.io/button.svg" alt="Run in Postman" style="height: 30px; width: 124px; vertical-align: middle;" />
  </a>
  
  <!-- Styled Raw JSON Button -->
  <a href="/docs/json" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; font-family: sans-serif; font-size: 12px; font-weight: 600; text-decoration: none; color: #495057; background-color: #f8f9fa; border: 1px solid #ced4da; border-radius: 3px; vertical-align: middle; transition: background 0.2s;">
    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    Raw OpenAPI JSON
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