-- Script pour recréer complètement la table provider_claims
-- ATTENTION : Ce script supprimera toutes les données existantes dans provider_claims
-- Utilisez ce script seulement si vous êtes sûr de vouloir tout recréer

-- 1. Supprimer la table existante (et toutes ses dépendances)
DROP TABLE IF EXISTS provider_claims CASCADE;

-- 2. Créer la table avec la structure complète
CREATE TABLE provider_claims (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    justification TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider_id, user_id, status) -- Un utilisateur ne peut avoir qu'une revendication en attente par fiche
);

-- 3. Créer les index
CREATE INDEX idx_provider_claims_provider_id ON provider_claims(provider_id);
CREATE INDEX idx_provider_claims_user_id ON provider_claims(user_id);
CREATE INDEX idx_provider_claims_status ON provider_claims(status);

-- 4. Créer la fonction pour updated_at
CREATE OR REPLACE FUNCTION update_provider_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le trigger
CREATE TRIGGER update_provider_claims_updated_at
    BEFORE UPDATE ON provider_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_claims_updated_at();

-- 6. Activer RLS
ALTER TABLE provider_claims ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques RLS
CREATE POLICY "Users can view their own claims"
    ON provider_claims
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims"
    ON provider_claims
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: Les politiques pour les admins nécessitent la fonction is_admin()
-- Si vous avez déjà exécuté supabase/setup_admin.sql, ces politiques seront créées automatiquement
-- Sinon, vous pouvez les ajouter manuellement après avoir créé la fonction is_admin()

-- 8. Vérifier que tout est correct
SELECT 
    'Table créée avec succès!' as message,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'provider_claims';

-- Afficher toutes les colonnes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'provider_claims'
ORDER BY ordinal_position;

