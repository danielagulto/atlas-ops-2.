# Atlas Ops 2.0 — Enterprise Operations Dashboard

Angular 20 frontend and TypeScript/Express REST API with PostgreSQL. This repository contains a development-stage demonstration project, not a production-ready service.

## Structure

- `frontend/` — Angular dashboard, inventory, orders, analytics
- `backend/` — Express API and PostgreSQL integration
- `compose.yaml` — local Docker Compose stack

## Quick start

Use Node.js 24. Set a strong `POSTGRES_PASSWORD` in the root `.env` (copy `.env.example`) and run `docker compose up --build`. The web app is configured for `http://localhost:8080` when using Docker Compose.

Alternatively, run `npm install` and `npm start` in `frontend/`; start PostgreSQL and the backend separately for API development.

**Status:** frontend screens currently use demo data; the API is not yet integrated into all pages. Authentication is not implemented. Do not expose this API publicly without implementing authentication, access controls, and hardening.
