-- Migration: Activer Row Level Security (RLS)
-- Date: 2026-01-30
-- Description: Sécurisation multi-utilisateurs avec isolation des données

-- 1. Ajouter la colonne user_id aux tables existantes
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Créer un index pour améliorer les performances des requêtes filtrées par user
CREATE INDEX IF NOT EXISTS prospects_user_id_idx ON prospects(user_id);
CREATE INDEX IF NOT EXISTS interactions_user_id_idx ON interactions(user_id);

-- 3. Activer RLS sur les tables
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- 4. Politique pour les prospects: Chaque utilisateur ne voit que ses propres prospects
CREATE POLICY "Users can view their own prospects"
  ON prospects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospects"
  ON prospects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects"
  ON prospects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects"
  ON prospects
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Politique pour les interactions: Accès via le prospect_id
CREATE POLICY "Users can view interactions of their prospects"
  ON interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interactions for their prospects"
  ON interactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interactions of their prospects"
  ON interactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND prospects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete interactions of their prospects"
  ON interactions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = interactions.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

-- 6. MIGRATION DES DONNÉES EXISTANTES (si vous avez déjà des données)
-- ATTENTION: Remplacez 'YOUR_USER_ID' par votre vrai user ID de auth.users
-- Vous pouvez le trouver avec: SELECT id FROM auth.users LIMIT 1;
-- 
-- UPDATE prospects SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE interactions SET user_id = (
--   SELECT user_id FROM prospects WHERE prospects.id = interactions.prospect_id
-- ) WHERE user_id IS NULL;

-- 7. Fonction helper pour obtenir le user_id courant (optionnel, pour debug)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- 8. Vue pour vérifier les policies (debug)
CREATE OR REPLACE VIEW user_prospects_count AS
SELECT 
  auth.uid() as user_id,
  COUNT(*) as total_prospects
FROM prospects
WHERE user_id = auth.uid()
GROUP BY auth.uid();
