-- Migration: Politiques RLS permissives
-- Date: 2026-01-30
-- Description: Permet l'accès aux données avec user_id NULL (mode développement)

-- 1. Supprimer les politiques strictes existantes
DROP POLICY IF EXISTS "Users can view their own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can update their own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can delete their own prospects" ON prospects;

DROP POLICY IF EXISTS "Users can view interactions of their prospects" ON interactions;
DROP POLICY IF EXISTS "Users can insert interactions for their prospects" ON interactions;
DROP POLICY IF EXISTS "Users can update interactions of their prospects" ON interactions;
DROP POLICY IF EXISTS "Users can delete interactions of their prospects" ON interactions;

-- 2. Créer des politiques permissives pour prospects
-- Permet l'accès si user_id = auth.uid() OU si user_id IS NULL
CREATE POLICY "Permissive: Users can view prospects"
  ON prospects
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Permissive: Users can insert prospects"
  ON prospects
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Permissive: Users can update prospects"
  ON prospects
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Permissive: Users can delete prospects"
  ON prospects
  FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- 3. Créer des politiques permissives pour interactions
-- Permet l'accès si l'interaction appartient à un prospect accessible
CREATE POLICY "Permissive: Users can view interactions"
  ON interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND (prospects.user_id = auth.uid() OR prospects.user_id IS NULL)
    )
  );

CREATE POLICY "Permissive: Users can insert interactions"
  ON interactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND (prospects.user_id = auth.uid() OR prospects.user_id IS NULL)
    )
  );

CREATE POLICY "Permissive: Users can update interactions"
  ON interactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND (prospects.user_id = auth.uid() OR prospects.user_id IS NULL)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND (prospects.user_id = auth.uid() OR prospects.user_id IS NULL)
    )
  );

CREATE POLICY "Permissive: Users can delete interactions"
  ON interactions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND (prospects.user_id = auth.uid() OR prospects.user_id IS NULL)
    )
  );

-- 4. S'assurer que RLS est activé
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- NOTE: Ces politiques permissives permettent l'accès aux données sans user_id
-- Elles sont adaptées pour le développement ou un système mono-utilisateur
-- Pour un vrai multi-utilisateurs, intégrez Supabase Auth et utilisez les politiques strictes
