import "dotenv/config";
import express from "express";
import Stripe from "stripe";

const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const port = process.env.PORT || 3000;
const appUrl = process.env.APP_URL || `http://localhost:${port}`;

const paidAccess = new Map();

app.disable("x-powered-by");
app.use(express.static(".", { dotfiles: "ignore" }));

app.get("/health", (request, response) => {
  response.json({ ok: true, service: "quick resume" });
});

app.post("/webhook", express.raw({ type: "application/json" }), async (request, response) => {
  const signature = request.headers["stripe-signature"];
  let event;

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return response.status(500).send("Configuration Stripe manquante.");
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
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    if (email) {
      paidAccess.set(email, {
        sessionId: session.id,
        paidAt: Date.now(),
        expiresAt,
      });
    }
  }

  response.json({ received: true });
});

app.use(express.json());

app.post("/create-checkout-session", async (request, response) => {
  if (!stripe) {
    return response.status(500).json({ error: "STRIPE_SECRET_KEY manquante." });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "quick resume - 24h resume access",
              description: "Resume PDF download access for 24h.",
            },
            unit_amount: 199,
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
  const access = paidAccess.get(email);

  response.json({
    active: Boolean(access && access.expiresAt > Date.now()),
    expiresAt: access?.expiresAt || null,
  });
});

app.listen(port, () => {
  console.log(`quick resume running on ${appUrl}`);
});
