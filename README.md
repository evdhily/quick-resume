# quick.cv

Site de création de CV avec accès au téléchargement PDF pendant 24h après paiement unique.

## Étape 1 déjà prête

- Page principale avec prix `1,99 €`.
- Bouton de paiement prêt à appeler `/create-checkout-session`.
- Pages retour Stripe: `success.html` et `cancel.html`.
- Pages de base: mentions légales, CGV, confidentialité, contact.
- Backend Express/Stripe de départ dans `server.js`.

## Configuration locale

Installer les dépendances:

```bash
npm install
```

Créer `.env` à partir de `.env.example`:

```bash
cp .env.example .env
```

Remplir:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_URL=http://localhost:3000
PORT=3000
```

Démarrer:

```bash
npm start
```

## À faire ensuite

1. Créer le compte Stripe.
2. Récupérer la clé secrète de test.
3. Configurer le webhook Stripe vers `/webhook`.
4. Remplacer les textes légaux `À compléter`.
5. Ajouter la vraie génération et protection du PDF.

## Déploiement Render

1. Créer un compte sur Render.
2. Connecter le dépôt GitHub du projet.
3. Choisir **New > Web Service**.
4. Build command:

```bash
npm install
```

5. Start command:

```bash
npm start
```

6. Ajouter les variables d'environnement:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_URL=https://votre-url-render.onrender.com
PORT=10000
```

Quand `quick.cv` sera connecté au service, remplacer `APP_URL` par:

```bash
APP_URL=https://quick.cv
```
