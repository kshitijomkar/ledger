# Khatabook Pro

An enterprise-grade digital ledger and bookkeeping application for small businesses.

## Project Structure

This is a monorepo containing three main applications:

- **[Backend](./apps/backend)**: Go (Gin) REST API.
- **[Web](./apps/web)**: Next.js 14 Frontend (PWA).
- **[Mobile](./apps/mobile)**: Flutter Mobile Application.

## Architecture

- **Offline-First**: Uses IndexedDB (Web) and SQLite (Mobile/Android) for local persistence.
- **Sync**: Automated background synchronization with conflict resolution.
- **Auth**: JWT-based secure authentication.

## Deployment

- **Frontend**: Hosted on **Vercel**.
- **Backend**: Hosted on **Render**.
- **Mobile**: APKs built via **GitHub Actions**.

## Getting Started

Refer to the individual README files in the `apps/` directory for setup instructions.
