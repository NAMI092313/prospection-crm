# CRM Prospection

Application Next.js (TypeScript, Tailwind) pour le suivi de prospection avec intégration Google Calendar.

## Fonctionnalités

- ✅ Gestion des prospects (création, édition, suppression)
- ✅ Historique des interactions
- ✅ Intégration Google Calendar (création d'événements)
- ✅ Authentification OAuth2 via NextAuth
- ✅ Données stockées en localStorage (client-side)

## Démarrer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Configuration Google Calendar (OAuth)

### 1. Créer les credentials Google

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer l'API Google Calendar
4. Créer des identifiants OAuth 2.0 (type: Application Web)
5. Ajouter les URL de redirection:
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-domaine.vercel.app/api/auth/callback/google` (production)

### 2. Configuration locale (.env.local)

```env
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret
NEXTAUTH_SECRET=votre_secret_aleatoire
NEXTAUTH_URL=http://localhost:3000
```

Générer un secret NextAuth sécurisé:
```bash
openssl rand -base64 32
```

## Déploiement sur Vercel

1. Pousser le code sur GitHub
2. Importer le projet sur Vercel
3. Ajouter les variables d'environnement (Settings > Environment Variables):
   - `GOOGLE_CLIENT_ID` ✅ Production, Preview, Development
   - `GOOGLE_CLIENT_SECRET` ✅ Production, Preview, Development
   - `NEXTAUTH_SECRET` ✅ Production, Preview, Development
   - `NEXTAUTH_URL=https://votre-projet.vercel.app` ✅ Production, Preview, Development

4. Redéployer et tester
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
