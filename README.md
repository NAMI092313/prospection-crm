# CRM Prospection

Application Next.js (TypeScript, Tailwind CSS v4) pour le suivi de prospection commerciale avec intégration Google Calendar et sécurité multi-utilisateur.

**Statut:** ✅ Production-ready

## Fonctionnalités

### 📊 Gestion des prospects
- ✅ CRUD complet (création, lecture, édition, suppression)
- ✅ Recherche multi-critères (nom, email, téléphone, entreprise)
- ✅ Filtrage par statut (8 états: nouveau, contact, qualification, proposition, négociation, conclu, perdu, intéressé)
- ✅ Validation des formulaires (email, téléphone français/international)
- ✅ Édition modale avec feedback visuel

### 📈 Vues et visualisation
- ✅ Vue grille avec statistiques en temps réel
- ✅ Vue Kanban drag-and-drop (7 colonnes par statut)
- ✅ Compteurs de prospects par statut
- ✅ Changement de statut via dropdown sur cartes
- ✅ Page Données (tableau) avec tri
- ✅ Export / Import Excel (.xlsx/.xls) sans doublons

### 📅 Intégration Google Calendar
- ✅ Création d'événements Google Calendar
- ✅ Lien automatique à la fiche prospect
- ✅ Authentification OAuth via NextAuth

### ⚙️ Paramètres
- ✅ Page Paramètres (thème, notifications, affichage)
- ✅ Thème clair / sombre / auto (persistant)

### 🔐 Sécurité et données
- ✅ Authentification NextAuth + Google OAuth
- ✅ Supabase PostgreSQL avec RLS (Row Level Security)
- ✅ Politiques permissives pour développement/mono-utilisateur
- ✅ Prêt pour intégration multi-utilisateur (user_id)

### 📱 Interactions
- ✅ Historique complet des interactions (appel, email, réunion, SMS, visite)
- ✅ Date, durée et notes pour chaque interaction
- ✅ Fuseau horaire local (correction UTC)

### ✅ Qualité
- ✅ 20 tests passants (Jest + React Testing Library)
- ✅ TypeScript strict
- ✅ Validation des emails et téléphones

## Architecture

```
/app               - Next.js App Router
  /api/auth       - NextAuth routes
  /data           - Page Données (tableau + import/export Excel)
  /prospects      - Pages prospects (grille, détail, création)
  /settings       - Page Paramètres
/components        - Composants React (ProspectCard, KanbanBoard, etc.)
/hooks            - Custom hooks (useProspects pour CRUD)
/lib              - Utilitaires (supabaseClient, validation)
/supabase         - Migrations SQL RLS
/public           - Assets statiques
/__tests__        - Tests unitaires et composants
```

## Technologies

- **Framework:** Next.js 16.1.4 + App Router + Turbopack
- **Langage:** TypeScript
- **Styles:** Tailwind CSS v4
- **BDD:** Supabase PostgreSQL
- **Auth:** NextAuth.js v4 + Google OAuth
- **Calendar:** Google Calendar API (googleapis v170)
- **Tests:** Jest + React Testing Library
- **Déploiement:** Vercel

## Démarrer en local

### 1. Installation
```bash
npm install
```

### 2. Configuration des variables d'environnement

Créer `.env.local` avec:
```env
# Google OAuth
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret

# NextAuth
NEXTAUTH_SECRET=<générer avec: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key

# (Optionnel) Azure AD pour Outlook Calendar
AZURE_AD_CLIENT_ID=votre_client_id
AZURE_AD_CLIENT_SECRET=votre_client_secret
AZURE_AD_TENANT_ID=votre_tenant_id
```

### 3. Configuration Google Calendar

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet ou en sélectionner un
3. **Activer l'API Google Calendar** (API et services > Bibliothèque > chercher "Calendar")
4. **Créer des credentials OAuth 2.0** (API et services > Identifiants)
   - Type: Application Web
   - URIs de redirection autorisées:
     - `http://localhost:3000/api/auth/callback/google` (développement)
     - `https://prospection-crm-votreUsername.vercel.app/api/auth/callback/google` (production)

### 4. Configuration Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Copier l'URL et la clé anonyme
3. Exécuter les migrations SQL:
   - `supabase/migrations/001_enable_rls.sql` (schéma + colonnes)
   - `supabase/migrations/002_permissive_rls.sql` (RLS permissif)

### 5. Démarrer le serveur
```bash
npm run dev
```

Ouvrir http://localhost:3000

## Scripts disponibles

```bash
npm run dev         # Démarrage en mode développement (Turbopack)
npm run build       # Build production
npm start           # Démarrage serveur production
npm test            # Exécuter tous les tests
npm run test:watch  # Mode watch des tests
npm run test:coverage # Rapport de couverture
npm run lint        # Vérifier ESLint
```

## Tests

L'application inclut **20 tests** couvrant:

- **Hooks:** useProspects (CRUD, chargement, erreurs)
- **Composants:** ProspectCard (display, status, delete), KanbanBoard (7 colonnes, drag-drop)

Exécuter:
```bash
npm test            # Run once
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

## Déploiement sur Vercel

### 1. Pousser sur GitHub
```bash
git add -A
git commit -m "feat: description"
git push origin main
```

### 2. Importer sur Vercel

1. Aller sur [Vercel](https://vercel.com) et se connecter
2. Cliquer "Add New > Project"
3. Sélectionner le repo GitHub
4. Ajouter les **Environment Variables** (Settings > Environment Variables):

| Variable | Valeur | Scope |
|----------|--------|-------|
| `GOOGLE_CLIENT_ID` | votre_id | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | votre_secret | Production, Preview, Development |
| `NEXTAUTH_SECRET` | votre_secret | Production, Preview, Development |
| `NEXTAUTH_URL` | https://votre-app.vercel.app | Production only |
| `NEXT_PUBLIC_SUPABASE_URL` | votre_url | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | votre_clé | Production, Preview, Development |
| `AZURE_AD_CLIENT_ID` | votre_id | Production, Preview, Development (optionnel) |
| `AZURE_AD_CLIENT_SECRET` | votre_secret | Production, Preview, Development (optionnel) |
| `AZURE_AD_TENANT_ID` | votre_tenant | Production, Preview, Development (optionnel) |

5. Cliquer "Deploy"

**App déployée:** https://prospection-crm.vercel.app

## Améliorations futures

- [ ] Multi-utilisateur avec RLS strict (intégrer Supabase Auth)
- [ ] Optimisations React (useMemo, useCallback, React.memo)
- [ ] Skeletons et loading states améliorés
- [ ] Toast notifications pour les actions
- [ ] Export CSV/PDF des prospects
- [ ] Thème avancé (composants dark mode complets)
- [ ] Statistiques avancées (graphiques, tendances)
- [ ] Rappels automatiques d'interactions
- [ ] Audit trail (historique des modifications)

## Fichiers clés

| Fichier | Description |
|---------|-------------|
| `app/page.tsx` | Dashboard principal (stats, grille, Kanban) |
| `app/prospects/new/page.tsx` | Création prospect avec validation |
| `app/prospects/[id]/page.tsx` | Détail prospect (interactions, édition, Google Calendar) |
| `hooks/useProspects.ts` | CRUD logic pour prospects/interactions |
| `lib/supabaseClient.ts` | Client Supabase configuré |
| `lib/validation.ts` | Validation email et téléphone |
| `components/KanbanBoard.tsx` | Vue Kanban drag-drop |
| `components/ProspectCard.tsx` | Carte prospect réutilisable |
| `supabase/migrations/` | Schéma DB et RLS |

## License

MIT
