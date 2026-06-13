# quick resume

Resume builder with paid PDF download access after the resume is finished.

## Ready

- Main page with no pricing shown before export.
- Checkout modal with `1,99 €` for 24h access and `8,99 €` for 7-day access.
- Download button ready to call `/create-checkout-session`.
- Stripe return pages: `success.html` and `cancel.html`.
- Basic legal pages: legal notice, terms, privacy, contact.
- Express/Stripe backend in `server.js`.
- PostgreSQL storage for paid access records.

## Local setup

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Fill in:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_URL=http://localhost:3000
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DATABASE_SSL=true
DATABASE_POOL_SIZE=10
```

Start:

```bash
npm start
```

## Database

quick resume uses PostgreSQL through `DATABASE_URL`.

The database stores confirmed Stripe sessions with:

- customer email;
- Stripe Checkout session ID;
- selected plan: `day` or `week`;
- payment time;
- access expiration time.

The app creates the required table and indexes automatically on startup:

```sql
paid_access (
  id,
  email,
  stripe_session_id,
  plan,
  paid_at,
  expires_at,
  created_at
)
```

For several thousand customers, use a managed PostgreSQL provider such as Supabase, Neon, Render
Postgres, Railway Postgres, or another production database provider.

The schema is also available in:

```bash
database/schema.sql
```

After setting `DATABASE_URL`, verify the connection and create the table/indexes with:

```bash
npm run db:check
```

### Supabase or Neon setup

1. Create a PostgreSQL project.
2. Copy the pooled connection string.
3. Put it in `.env` as `DATABASE_URL`.
4. Keep `DATABASE_SSL=true`.
5. Run `npm run db:check`.
6. Start the app with `npm start`.

Example `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_URL=http://localhost:3000
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DATABASE_SSL=true
DATABASE_POOL_SIZE=10
```

## Next steps

1. Create the Stripe account.
2. Get the test secret key.
3. Configure the Stripe webhook to `/webhook`.
4. Replace the legal placeholder text.
5. Add real PDF generation and download protection.

## Render deployment

1. Create a Render account.
2. Connect the project GitHub repository.
3. Choose **New > Web Service**.
4. Build command:

```bash
npm install
```

5. Start command:

```bash
npm start
```

6. Add environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_URL=https://your-render-url.onrender.com
PORT=10000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DATABASE_SSL=true
DATABASE_POOL_SIZE=10
```

When your domain is connected to the service, replace `APP_URL` with:

```bash
APP_URL=https://your-domain.com
```
