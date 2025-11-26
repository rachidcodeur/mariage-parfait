-- Script pour vérifier et créer la table mariage_parfait_contact_submissions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions'
    ) THEN
        RAISE NOTICE 'La table n''existe pas. Création en cours...';
        
        -- Créer la table
        CREATE TABLE mariage_parfait_contact_submissions (
            id BIGSERIAL PRIMARY KEY,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            request_type TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL
        );
        
        RAISE NOTICE 'Table créée avec succès.';
    ELSE
        RAISE NOTICE 'La table existe déjà.';
    END IF;
END $$;

-- 2. Vérifier les colonnes existantes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'mariage_parfait_contact_submissions'
ORDER BY ordinal_position;

-- 3. Ajouter les colonnes manquantes si nécessaire
DO $$
BEGIN
    -- Vérifier et ajouter 'name'
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions ADD COLUMN name TEXT;
        RAISE NOTICE 'Colonne name ajoutée.';
    END IF;

    -- Vérifier et ajouter 'email'
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions ADD COLUMN email TEXT;
        RAISE NOTICE 'Colonne email ajoutée.';
    END IF;

    -- Vérifier et ajouter 'request_type'
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'request_type'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions ADD COLUMN request_type TEXT;
        RAISE NOTICE 'Colonne request_type ajoutée.';
    END IF;

    -- Vérifier et ajouter 'subject'
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'subject'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions ADD COLUMN subject TEXT;
        RAISE NOTICE 'Colonne subject ajoutée.';
    END IF;

    -- Vérifier et ajouter 'message'
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'message'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions ADD COLUMN message TEXT;
        RAISE NOTICE 'Colonne message ajoutée.';
    END IF;
END $$;

-- 4. Configurer RLS (Row Level Security)
ALTER TABLE mariage_parfait_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public to insert contact submissions" ON mariage_parfait_contact_submissions;
DROP POLICY IF EXISTS "Allow public insert on contact submissions" ON mariage_parfait_contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON mariage_parfait_contact_submissions;

-- Créer une nouvelle politique pour permettre l'insertion publique
CREATE POLICY "Allow public to insert contact submissions"
ON mariage_parfait_contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
ON mariage_parfait_contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
ON mariage_parfait_contact_submissions(email);

-- 6. Vérification finale
SELECT 
    'Table créée et configurée avec succès!' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'mariage_parfait_contact_submissions';

