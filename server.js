import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import { getActiveAccessByEmail, getDatabaseInfo, savePaidAccess } from "./database.js";

const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const port = process.env.PORT || 3000;
const appUrl = process.env.APP_URL || `http://localhost:${port}`;

const plans = {
  day: {
    name: "quick resume - 24h resume access",
    description: "Resume PDF download access for 24h.",
    unitAmount: 199,
    durationMs: 24 * 60 * 60 * 1000,
  },
  week: {
    name: "quick resume - 7-day resume access",
    description: "Resume PDF download access for 7 days.",
    unitAmount: 899,
    durationMs: 7 * 24 * 60 * 60 * 1000,
  },
};

app.disable("x-powered-by");
app.use(express.static(".", { dotfiles: "ignore" }));

app.get("/health", (request, response) => {
  response.json({ ok: true, service: "quick resume", database: getDatabaseInfo().path });
});

app.post("/webhook", express.raw({ type: "application/json" }), async (request, response) => {
  const signature = request.headers["stripe-signature"];
  let event;

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return response.status(500).send("Missing Stripe configuration.");
  }

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email;
    const plan = plans[session.metadata?.plan] || plans.day;
    const paidAt = Date.now();
    const expiresAt = Date.now() + plan.durationMs;

    if (email) {
      savePaidAccess({
        email,
        sessionId: session.id,
        plan: session.metadata?.plan || "day",
        paidAt,
        expiresAt,
      });
    }
  }

  response.json({ received: true });
});

app.use(express.json());

app.post("/create-checkout-session", async (request, response) => {
  if (!stripe) {
    return response.status(500).json({ error: "Missing STRIPE_SECRET_KEY." });
  }

  const planKey = request.body?.plan;
  const plan = plans[planKey];

  if (!plan) {
    return response.status(400).json({ error: "Unknown checkout plan." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      metadata: {
        plan: planKey,
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel.html`,
    });

    response.json({ url: session.url });
  } catch (error) {
    response.status(500).json({ error: "Unable to create the Stripe session." });
  }
});

app.get("/access-status", (request, response) => {
  const email = String(request.query.email || "").toLowerCase();
  const access = email ? getActiveAccessByEmail(email) : null;

  response.json({
    active: Boolean(access),
    plan: access?.plan || null,
    expiresAt: access?.expiresAt || null,
  });
});

app.listen(port, () => {
  console.log(`quick resume running on ${appUrl}`);
});
