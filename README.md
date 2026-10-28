# ScoreKings SaaS Integration Kit

Enterprise partner integration layer and data-licensing gateway for ScoreKings. This starter repository demonstrates API governance, legacy data migration, partner authentication, and integration troubleshooting.

[![Run in Postman](https://run.pstmn.io/button.svg)](./postman/ScoreKings_SaaS_Integration.postman_collection.json)

## Requirements

- Node.js 20+
- MongoDB 6+

## Quick start

```sh
npm install
cp .env.example .env
# Set MONGODB_URI and SCOREKINGS_API_KEY in .env
npm run dev
```

The API listens on `http://localhost:3000`. Interactive API documentation is at `http://localhost:3000/docs`; the OpenAPI source is [docs/openapi.yaml](./docs/openapi.yaml).

## Setup from a new checkout

```sh
mkdir -p src/{config,controllers,middleware,models,routes,services,types} postman docs
npm install express mongoose swagger-ui-express swagger-jsdoc cors helmet dotenv express-rate-limit csv-parse
npm install --save-dev typescript ts-node-dev jest ts-jest @types/jest @types/node @types/express @types/cors @types/swagger-ui-express @types/swagger-jsdoc
npx tsc --init
```

The checked-in `package.json` and `tsconfig.json` already contain the project configuration; the commands above are included for reproducibility.

## API overview

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | None | Service and API status |
| `POST` | `/api/v1/migration/ingest` | `X-ScoreKings-API-Key` | Transform legacy JSON or CSV records |
| `GET` | `/api/v1/licensing/leagues` | `X-ScoreKings-API-Key` | Paginated partner data feed |

Partner API credentials are stored as SHA-256 hashes in the `PartnerKey` collection. For a local quick start, configure `SCOREKINGS_API_KEY`; do not commit real credentials. Migration requests persist transformed records and an audit log. See [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) for the discovery workflow and field mapping.

## Useful commands

```sh
npm run dev       # Hot-reload development server
npm run build     # Compile strict TypeScript to dist/
npm start         # Run the production build
npm test          # Run Jest tests
```

Import the checked-in collection and environment from [postman/](./postman/) to run the integration checks. Configure `baseUrl` and `apiKey` in the Postman environment before sending protected requests.
