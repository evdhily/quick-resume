# quick resume

Resume builder with paid PDF download access after the resume is finished.

## Ready

- Main page with no pricing shown before export.
- Checkout modal with `1,99 €` for 24h access and `8,99 €` for 7-day access.
- Download button ready to call `/create-checkout-session`.
- Stripe return pages: `success.html` and `cancel.html`.
- Basic legal pages: legal notice, terms, privacy, contact.
- Starter Express/Stripe backend in `server.js`.

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
```

Start:

```bash
npm start
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
```

When your domain is connected to the service, replace `APP_URL` with:

```bash
APP_URL=https://your-domain.com
```
