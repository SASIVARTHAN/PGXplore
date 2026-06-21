# PGXplore Backend

Production-ready Spring Boot REST API for the PGXplore PG accommodation discovery platform.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Java 17 |
| Framework | Spring Boot 3.2 |
| Security | Spring Security 6 + JWT |
| Database | MySQL 8 + JPA/Hibernate |
| Migrations | Flyway |
| Images | Firebase Storage |
| API Docs | springdoc-openapi (Swagger UI) |
| Mapping | MapStruct + Lombok |
| Testing | JUnit 5, Mockito, Testcontainers |

## Prerequisites

- Java 17+
- Maven 3.9+
- MySQL 8 (or Docker)
- Firebase service account JSON (for image upload)
- OpenAI API key (optional, for natural language search)

## Quick Start (Local)

```bash
# 1. Start MySQL
docker compose up mysql -d

# 2. Configure environment (see table below)

# 3. Build and run
mvn spring-boot:run
```

API: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

## Docker (Full Stack)

```bash
docker compose up --build
```

## Seed Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@pgxplore.com | Password@123 | ADMIN |
| rajesh@example.com | Password@123 | PG_OWNER |
| priya@example.com | Password@123 | PG_OWNER |
| ananya@example.com | Password@123 | USER |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | JDBC connection URL | `jdbc:mysql://localhost:3306/pgxplore` |
| `DB_USERNAME` | Database user | `root` |
| `DB_PASSWORD` | Database password | *(set in `application-dev.yml` or env)* |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | dev placeholder |
| `JWT_ACCESS_EXPIRY` | Access token minutes | `15` |
| `JWT_REFRESH_EXPIRY` | Refresh token days | `7` |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase JSON | `classpath:firebase-service-account.json` |
| `FIREBASE_BUCKET_NAME` | Firebase Storage bucket | — |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `MAIL_USERNAME` | SMTP username | — |
| `MAIL_PASSWORD` | SMTP password | — |
| `FRONTEND_URL` | Frontend base URL | `http://localhost:5173` |
| `SERVER_PORT` | HTTP port | `8080` |

## Running Tests

```bash
mvn test
```

Integration tests use Testcontainers (requires Docker).

## API Overview

| Module | Base Path | Auth |
|--------|-----------|------|
| Auth | `/api/auth` | Public |
| Users | `/api/users` | JWT |
| PG Listings | `/api/pg` | Mixed |
| Search | `/api/pg/search` | Public |
| Reviews | `/api/reviews` | Mixed |
| Images | `/api/images` | PG_OWNER, ADMIN |
| Inquiries | `/api/inquiries` | JWT |
| Recently Viewed | `/api/recently-viewed` | JWT |
| Admin | `/api/admin` | ADMIN |
| AI Search | `/api/search/natural` | JWT |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full endpoint reference.

## Project Structure

```
src/main/java/com/pgxplore/
├── config/           # Security, Swagger, Firebase
├── security/         # JWT, filters, UserPrincipal
├── controller/       # REST endpoints
├── service/impl/     # Business logic
├── repository/       # JPA repositories + Specifications
├── model/entity/     # JPA entities
├── model/enums/      # Role, Gender
├── dto/              # Request/response DTOs
├── mapper/           # MapStruct mappers
├── exception/        # Custom exceptions + handler
├── util/             # SecurityUtils
└── documentation/    # API tag constants
```

## Roles

- **ADMIN** — Manage users, PGs, verify owners, moderate reviews
- **PG_OWNER** — Create/manage listings, upload images, view inquiries
- **USER** — Search, save favorites, submit reviews, contact owners
