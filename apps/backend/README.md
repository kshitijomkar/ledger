# Khatabook Pro - Backend

The core API for Khatabook Pro, built with Go and Gin.

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Gonic
- **Database**: PostgreSQL (GORM)
- **Containerization**: Docker

## Local Setup

1. `cd apps/backend`
2. `cp .env.example .env` (fill in your DATABASE_URL and JWT_SECRET)
3. `go run cmd/main.go`

## Deployment (Render)

1. Connect your repository to Render.
2. Select **Web Service**.
3. Set the Root Directory to `apps/backend`.
4. Render will automatically detect the `Dockerfile`.
5. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT=8000`.
