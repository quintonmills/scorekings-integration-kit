# ScoreKings: Enterprise SaaS Integration & API Gateway

[![Run in Postman](https://run.pstmn.io/button.svg)](./postman/ScoreKings_SaaS_Integration.postman_collection.json)
[![CI/CD Pipeline](https://github.com/quintonmills/ScoreKings/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/quintonmills/ScoreKings/actions/workflows/ci-cd.yml)
[![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI-3.0-blue.svg)](https://score-kings-ivory.vercel.app/docs/json)
[![Terraform Validated](https://img.shields.io/badge/Terraform-1.5%2B-purple.svg)]()

An enterprise-grade B2B integration platform and cloud-native partner API designed to streamline legacy data migration, automated league feed synchronization, and secure third-party developer onboarding.

---

## 🏗️ Cloud-Native Architecture

```mermaid
graph TD
    %% Client & Gateway Layer
    Client["Client / B2B Partner"] -->|HTTP / HTTPS| Proxy["Render Reverse Proxy / ALB"]
    Proxy -->|Forwarded Request| Gateway["Express API Gateway (Node.js / TypeScript)"]

    %% Gateway Middleware Layer
    subgraph Gateway Middleware
        Gateway --> Helmet["Helmet Security Headers"]
        Gateway --> RateLimiter["Dynamic Rate Limiter (60 vs 1000 req)"]
        Gateway --> ErrorHandler["RFC 7807 Problem Details Handler"]
    end

    %% Infrastructure & Data Persistence
    Gateway -->|Mongoose ODM| Atlas["MongoDB Atlas M0 Replica Set"]
    
    %% Terraform Provisioning
    Terraform["Terraform IaC"] -->|Provisions Cluster & Access List| Atlas

    classDef primary fill:#1f2937,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef middleware fill:#374151,stroke:#60a5fa,stroke-width:1px,color:#fff;
    classDef infra fill:#111827,stroke:#10b981,stroke-width:2px,color:#fff;

    class Client,Gateway primary;
    class Helmet,RateLimiter,ErrorHandler middleware;
    class Atlas,Terraform infra;

## 🚀 Key Solutions Engineering Capabilities

- **Decoupled Infrastructure as Code (IaC):** Declaratively provisions production-ready MongoDB Atlas M0 replica-set clusters, database users, and secure IP access lists using Terraform.
- **Production-Grade Containerization:** Multi-stage `Dockerfile` and `docker-compose` setup ensure local-to-production deployment parity across cloud hosting providers such as Render and AWS.
- **Dynamic API Gateway & Tiering:** Enforces security headers with `helmet`, reverse-proxy IP tracking, and dynamic rate limiting (Free tier: 60 requests per 15 minutes; Partner tier: 1,000 requests per 15 minutes via API keys).
- **Enterprise Error Handling:** Provides RFC 7807-compliant structured error payloads (`application/problem+json`) for consistent client troubleshooting and error boundaries.
- **Automated CI/CD Quality Gates:** GitHub Actions workflow runs automated build checks, strict TypeScript compilation, Terraform validation, and container build verification on every push.

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js 20+, TypeScript, Express
- **Database & Infrastructure:** MongoDB Atlas (M0 Cluster), Terraform, Docker
- **Security & Governance:** Helmet, Express Rate Limit, SHA-256 API key hashing
- **Developer Experience:** Swagger UI, OpenAPI 3.0, Postman collections with automated `pm.test` assertions

---

## 📋 Requirements

- Node.js `20+`
- Docker and Docker Compose *(optional for containerized runs)*
- Terraform `1.5+` *(optional for cloud infrastructure provisioning)*

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository and install dependencies
git clone https://github.com/quintonmills/ScoreKings.git
cd ScoreKings
npm install

# 2. Configure local environment variables
cp .env.example .env
# Edit .env to set your MONGODB_URI and SCOREKINGS_API_KEY

# 3. Start the development server with hot reloading
npm run dev
```

The API listens on `http://localhost:3000`.

- Interactive Swagger UI documentation: `http://localhost:3000/docs`
- Raw OpenAPI JSON specification: `http://localhost:3000/docs/json`

## 🐳 Running via Docker Compose

To run the application container locally alongside an isolated network configuration:

```bash
docker-compose up --build
```

## ☁️ Terraform Infrastructure Deployment

To provision your cloud MongoDB Atlas cluster and network access rules with Terraform:

```bash
cd terraform

# Export your Atlas credentials
export TF_VAR_atlas_public_key="your_public_key"
export TF_VAR_atlas_private_key="your_private_key"
export TF_VAR_atlas_project_id="your_project_id"

# Initialize and apply the infrastructure
terraform init
terraform plan
terraform apply
```

## 🔌 API Overview

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | None | Service and API status check |
| `POST` | `/api/v1/migration/ingest` | `X-ScoreKings-API-Key` | Transform legacy JSON or CSV records with audit logging |
| `GET` | `/api/v1/licensing/leagues` | `X-ScoreKings-API-Key` | Paginated partner data feed |

Partner API credentials are validated against SHA-256 hashes stored in the database. See the [Migration Guide](./docs/MIGRATION_GUIDE.md) for detailed discovery workflows and field mapping.

## 🛠️ Useful Commands

```bash
npm run dev       # Hot-reload development server
npm run build     # Compile strict TypeScript to dist/
npm start         # Run the compiled production build
npm test          # Run Jest test suites
```

## ☁️ Render Deployment & CI/CD

The TypeScript compiler and declaration packages are managed as development dependencies to optimize production bundle sizes.

**Build Command:**

```bash
npm ci --include=dev && npm run build
```

**Start Command:**

```bash
npm start
```
