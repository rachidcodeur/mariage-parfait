-- Script de vérification et correction de la table provider_claims
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims'
    ) THEN
        RAISE NOTICE 'La table provider_claims n''existe pas. Création en cours...';
        
        -- Créer la table
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
            UNIQUE(provider_id, user_id, status)
        );
        
        RAISE NOTICE 'Table provider_claims créée avec succès.';
    ELSE
        RAISE NOTICE 'La table provider_claims existe déjà.';
    END IF;
END $$;

-- 2. Vérifier et ajouter la colonne justification si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'justification'
    ) THEN
        RAISE NOTICE 'La colonne justification n''existe pas. Ajout en cours...';
        ALTER TABLE provider_claims ADD COLUMN justification TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Colonne justification ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne justification existe déjà.';
    END IF;
END $$;

-- 3. Vérifier et ajouter les autres colonnes si elles n'existent pas
DO $$
BEGIN
    -- provider_id
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'provider_id'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE;
    END IF;
    
    -- user_id
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- status
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
        ALTER TABLE provider_claims ADD CONSTRAINT provider_claims_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
    
    -- admin_notes
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN admin_notes TEXT;
    END IF;
    
    -- reviewed_by
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'reviewed_by'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- reviewed_at
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'reviewed_at'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;
    
    -- created_at
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    -- updated_at
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_claims' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE provider_claims ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- 4. Créer les index si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_provider_claims_provider_id ON provider_claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_claims_user_id ON provider_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_claims_status ON provider_claims(status);

-- 5. Créer la fonction pour updated_at si elle n'existe pas
CREATE OR REPLACE FUNCTION update_provider_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer le trigger si il n'existe pas
DROP TRIGGER IF EXISTS update_provider_claims_updated_at ON provider_claims;
CREATE TRIGGER update_provider_claims_updated_at
    BEFORE UPDATE ON provider_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_claims_updated_at();

-- 7. Activer RLS
ALTER TABLE provider_claims ENABLE ROW LEVEL SECURITY;

-- 8. Créer les politiques RLS si elles n'existent pas
DROP POLICY IF EXISTS "Users can view their own claims" ON provider_claims;
CREATE POLICY "Users can view their own claims"
    ON provider_claims
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own claims" ON provider_claims;
CREATE POLICY "Users can create their own claims"
    ON provider_claims
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: Les politiques pour les admins nécessitent la fonction is_admin()
-- Assurez-vous que cette fonction existe (voir supabase/setup_admin.sql)

-- 9. Afficher la structure finale de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'provider_claims'
ORDER BY ordinal_position;

