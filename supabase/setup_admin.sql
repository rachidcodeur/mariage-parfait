-- Script pour créer un super admin
-- Ce script doit être exécuté après que l'utilisateur se soit inscrit

-- Option 1: Utiliser les métadonnées utilisateur (recommandé)
-- Mettre à jour les métadonnées de l'utilisateur pour le marquer comme admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'rachdevcodeur@gmail.com';

-- Option 2: Créer une table admins (alternative)
-- Cette table peut être utilisée si vous préférez une approche plus structurée
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier dans les métadonnées
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_uuid
    AND (raw_user_meta_data->>'is_admin')::boolean = true
  ) THEN
    RETURN true;
  END IF;

  -- Vérifier dans la table admins
  IF EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = user_uuid
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insérer l'utilisateur dans la table admins (si vous utilisez cette approche)
-- Note: Vous devez d'abord obtenir l'ID de l'utilisateur depuis auth.users
INSERT INTO admins (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'rachdevcodeur@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- RLS pour la table admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Politique : Seuls les admins peuvent voir la liste des admins
CREATE POLICY "Admins can view admins"
  ON admins
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Fonction helper pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Vérifier dans la table admins d'abord
  SELECT role INTO user_role
  FROM admins
  WHERE user_id = user_uuid;

  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;

  -- Vérifier dans les métadonnées
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_uuid
    AND (raw_user_meta_data->>'is_admin')::boolean = true
  ) THEN
    RETURN 'admin';
  END IF;

  RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

