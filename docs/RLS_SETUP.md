# 🔐 Guide d'Activation RLS (Row Level Security)

## ✅ Fichiers Modifiés

1. **supabase/migrations/001_enable_rls.sql** - Migration SQL
2. **lib/supabaseClient.ts** - Support JWT pour RLS
3. **hooks/useProspects.ts** - Ajout user_id

## 🚀 Étapes d'Installation

### 1️⃣ Exécuter la Migration SQL

**Option A: Via Dashboard Supabase (Recommandé)**

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet: `slwetvqfmaxiycvfolcv`
3. Cliquez sur **SQL Editor** dans le menu
4. Cliquez sur **New Query**
5. Copiez-collez le contenu de `supabase/migrations/001_enable_rls.sql`
6. Cliquez sur **Run** (ou Ctrl+Enter)

**Option B: Via CLI Supabase**

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Lier votre projet
supabase link --project-ref slwetvqfmaxiycvfolcv

# Appliquer la migration
supabase db push
```

### 2️⃣ Configurer NextAuth avec Supabase

Modifiez `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clé admin
  }),
  callbacks: {
    async session({ session, user }) {
      // Ajouter l'ID utilisateur à la session
      if (session?.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 3️⃣ Ajouter les Variables d'Environnement

Ajoutez dans `.env.local`:

```bash
# Supabase Service Role Key (clé admin pour NextAuth)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...votre_clé_service_role
```

**Où trouver la Service Role Key:**
1. Dashboard Supabase > Settings > API
2. Section "Project API keys"
3. Copiez **service_role** (⚠️ Ne JAMAIS exposer côté client)

### 4️⃣ Migrer les Données Existantes (Si applicable)

Si vous avez déjà des prospects dans la DB:

```sql
-- 1. Trouver votre user ID
SELECT id, email FROM auth.users LIMIT 1;

-- 2. Associer vos prospects existants à votre user
UPDATE prospects 
SET user_id = 'VOTRE_USER_ID_ICI' 
WHERE user_id IS NULL;

-- 3. Associer les interactions
UPDATE interactions SET user_id = (
  SELECT user_id FROM prospects 
  WHERE prospects.id = interactions.prospect_id
) WHERE user_id IS NULL;
```

### 5️⃣ Installer le Package Adapter

```bash
npm install @auth/supabase-adapter
```

## 🧪 Test de Fonctionnement

### Vérifier que RLS est actif

```sql
-- Dashboard Supabase > SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('prospects', 'interactions');

-- Résultat attendu: rowsecurity = true
```

### Tester les Policies

```sql
-- Se connecter en tant qu'utilisateur (via l'app)
-- Puis dans SQL Editor:

-- Cette requête ne retourne QUE vos prospects
SELECT * FROM prospects;

-- Essayer de voir les prospects d'un autre user (devrait retourner 0)
SELECT * FROM prospects WHERE user_id != auth.uid();
```

### Test dans l'Application

1. Créez un nouveau prospect
2. Vérifiez dans Supabase Dashboard > Table Editor > prospects
3. La colonne `user_id` doit être remplie avec votre ID
4. Déconnectez-vous et reconnectez-vous
5. Vos prospects doivent toujours être visibles

## 🔍 Debugging

### Problème: Aucun prospect n'apparaît

```sql
-- Vérifier si les prospects ont un user_id
SELECT id, nom, user_id FROM prospects;

-- Vérifier votre user_id actuel
SELECT auth.uid();

-- Comparer les deux
```

**Solution:** Exécuter l'étape 4 (Migration des données)

### Problème: Erreur "new row violates row-level security policy"

Cela signifie que `user_id` est NULL lors de l'insertion.

**Solution:** Vérifier que la session NextAuth contient bien `user.id`:

```typescript
// Dans votre composant
const { data: session } = useSession();
console.log('User ID:', (session?.user as any)?.id);
```

### Problème: "permission denied for table prospects"

Vérifier que les policies sont bien créées:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('prospects', 'interactions');
```

## 📊 Avantages de RLS Activé

| Avant RLS | Après RLS |
|-----------|-----------|
| ❌ Tous les prospects visibles | ✅ Seulement MES prospects |
| ❌ Possible de supprimer les données d'autres users | ✅ Impossible d'accéder aux données d'autrui |
| ❌ Sécurité = code métier | ✅ Sécurité = base de données |
| ❌ Un seul utilisateur | ✅ Multi-utilisateurs prêt |

## 🎯 Prochaines Étapes

1. ✅ RLS activé
2. ⏭️ Ajouter d'autres utilisateurs (invitation)
3. ⏭️ Dashboard admin (voir tous les prospects)
4. ⏭️ Partage de prospects entre users

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes:

1. Vérifiez les logs dans Dashboard Supabase > Logs
2. Testez les requêtes SQL manuellement
3. Vérifiez que NextAuth retourne bien un `user.id`

RLS est maintenant **prêt à être activé** ! 🚀
