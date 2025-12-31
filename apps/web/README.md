# Khatabook Pro - Web Frontend

A modern, offline-first Next.js application for business ledger management.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Radix UI + shadcn/ui
- **Persistence**: IndexedDB + Capacitor SQLite

## Local Setup

1. `cd apps/web`
2. `npm install`
3. `cp .env.example .env`
4. `npm run dev`

## Deployment (Vercel)

1. Connect your repository to Vercel.
2. Set the Root Directory to `apps/web`.
3. Add environment variable: `NEXT_PUBLIC_API_URL` (your Render backend URL).
4. Vercel will handle the rest.
