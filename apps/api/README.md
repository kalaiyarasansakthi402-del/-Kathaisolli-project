# Kathaisolli API

NestJS REST API source for the Kathaisolli monorepo. The API currently provides development status, email/password registration and login, JWT authentication, basic role guards, and Prisma persistence for users and creator profiles.

For prerequisites and setup, use the [root README](../../README.md). Local services run with Docker Compose; run Prisma commands and the API from the monorepo root.

Routes are versioned under `/api/v1`. Development OpenAPI documentation is available at `/api/docs`. The API currently issues short-lived access tokens only; refresh-token rotation and persistent device sessions are not implemented.
