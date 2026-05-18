# KrrishJazz

Next.js property marketplace with Prisma and PostgreSQL.

## Database setup

### Local development (Docker)

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
npm run db:up
```

3. Run migrations and generate the Prisma client:

```bash
npm run db:migrate
```

4. (Optional) Seed sample listings:

```bash
npm run seed:properties
```

5. Start the app:

```bash
npm run dev
```

### Supabase Postgres

**Important:** `DATABASE_URL` / `DIRECT_URL` must use the **same project** as `NEXT_PUBLIC_SUPABASE_URL`  
(e.g. if the URL contains `cdimaijpnpfxccendzuu`, the DB host must be `db.cdimaijpnpfxccendzuu.supabase.co`).

1. Supabase Dashboard → **Connect** → **ORMs** → **Prisma**.
2. Copy into `.env`:
   - **Session pooler** (port 5432) → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL`
3. Add `?sslmode=require` if not already in the string.
4. In your terminal (stop `npm run dev` first):

```bash
npx prisma generate
npm run db:test
npm run db:setup
```

`npm run db:test` loads `.env` / `.env.local`, prefers **`DIRECT_URL`** for CLI checks, and appends `sslmode=require` for Supabase hosts.

If `db:test` fails with **P1001** or TLS/credential errors, check: project not paused, password correct, region in pooler URL matches dashboard, `DIRECT_URL` uses session pooler port **5432** (not PgBouncer 6543), and try **Connect → IPv4 add-on** if on a restricted network.

### Production (Vercel / hosted Postgres)

1. Set `DATABASE_URL` in Vercel environment variables.
2. Run migrations on deploy:

```bash
npm run db:migrate:deploy
```

Recommended Vercel build command: `prisma generate && prisma migrate deploy && next build`

## Useful commands

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start local Postgres via Docker |
| `npm run db:migrate` | Create/apply dev migrations |
| `npm run db:migrate:deploy` | Apply migrations in production |
| `npm run db:studio` | Open Prisma Studio |
| `npm run seed:properties` | Seed rich property data |

## Migrating from SQLite

If you have data in `prisma/dev.db`, export it before switching, then import into Postgres after migrations. Fresh setups can skip this and use `npm run seed:properties` instead.
