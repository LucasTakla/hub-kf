# Kapital Funding Hub

Internal operations hub for Kapital Funding — centralizing leads, ads, marketing, email, growth, and finance.

## V1 includes

- Next.js app shell with Kapital Funding branding
- Clerk authentication (protected routes)
- PostgreSQL database via Prisma
- Roadmap page (database-backed) with phases, priorities, and delivery dates
- Placeholder pages for all future modules

## Prerequisites

- Node.js 20+
- [Neon](https://neon.tech) PostgreSQL database (or any Postgres)
- [Clerk](https://clerk.com) application

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `DATABASE_URL` and Clerk keys in `.env.local`.

4. Push schema and seed roadmap data:

```bash
npm run db:push
npm run db:seed
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Hostinger (Git)

1. Push this repo to GitHub.
2. In Hostinger hPanel → **Websites** → **Add Website** → **Node.js Apps**.
3. Connect your GitHub repository.
4. Build settings:
   - **Install:** `npm ci`
   - **Build:** `npm run build`
   - **Start:** `npm run start -- -p $PORT`
   - **Node.js:** 20
5. Add all environment variables from `.env.example` in Hostinger app settings.
6. Attach your subdomain and deploy.

After first deploy, run migrations/seed against production DB from your machine:

```bash
DATABASE_URL="your-production-url" npm run db:push
DATABASE_URL="your-production-url" npm run db:seed
```

## Clerk configuration

In the Clerk dashboard, add your domains:

- `http://localhost:3000` (development)
- `https://your-subdomain.domain.com` (production)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed roadmap and integrations |
| `npm run db:studio` | Open Prisma Studio |
