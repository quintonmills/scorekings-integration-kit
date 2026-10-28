import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ScoreKings Partner Integration API",
      version: "1.0.0",
      description: "Partner API for legacy data migration and licensed league feeds."
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        ScoreKingsApiKey: {
          type: "apiKey",
          in: "header",
          name: "X-ScoreKings-API-Key"
        }
      }
    }
  },
  apis: [path.resolve(__dirname, "../routes/*.{ts,js}")]
};

export const openApiSpec = swaggerJsdoc(options);
