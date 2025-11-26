-- Script pour adapter la table mariage_parfait_contact_submissions au formulaire de contact
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
    -- Ajouter la colonne request_type (type de demande)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'request_type'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions 
        ADD COLUMN request_type TEXT;
        RAISE NOTICE 'Colonne request_type ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne request_type existe déjà.';
    END IF;

    -- Ajouter la colonne subject (sujet)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'subject'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions 
        ADD COLUMN subject TEXT;
        RAISE NOTICE 'Colonne subject ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne subject existe déjà.';
    END IF;

    -- Ajouter la colonne name (nom complet) si elle n'existe pas
    -- On peut combiner prenom et nom ou créer une nouvelle colonne
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions 
        ADD COLUMN name TEXT;
        RAISE NOTICE 'Colonne name ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne name existe déjà.';
    END IF;
END $$;

-- 2. Optionnel : Remplir la colonne name avec prenom + nom pour les anciennes entrées
-- (Décommentez si vous voulez migrer les anciennes données)
/*
UPDATE mariage_parfait_contact_submissions 
SET name = CONCAT(COALESCE(prenom, ''), ' ', COALESCE(nom, ''))
WHERE name IS NULL AND (prenom IS NOT NULL OR nom IS NOT NULL);
*/

-- 3. Optionnel : Supprimer les colonnes non utilisées par le formulaire actuel
-- (Décommentez seulement si vous êtes sûr de ne plus en avoir besoin)
/*
DO $$
BEGIN
    -- Supprimer prenom (remplacé par name)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'prenom'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions DROP COLUMN prenom;
        RAISE NOTICE 'Colonne prenom supprimée.';
    END IF;

    -- Supprimer nom (remplacé par name)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'nom'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions DROP COLUMN nom;
        RAISE NOTICE 'Colonne nom supprimée.';
    END IF;

    -- Supprimer entreprise (non utilisé dans le formulaire)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'entreprise'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions DROP COLUMN entreprise;
        RAISE NOTICE 'Colonne entreprise supprimée.';
    END IF;

    -- Supprimer telephone (non utilisé dans le formulaire)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'telephone'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions DROP COLUMN telephone;
        RAISE NOTICE 'Colonne telephone supprimée.';
    END IF;

    -- Supprimer adresse (non utilisé dans le formulaire)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'adresse'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions DROP COLUMN adresse;
        RAISE NOTICE 'Colonne adresse supprimée.';
    END IF;

    -- Supprimer code_postal (non utilisé dans le formulaire)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'code_postal'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions DROP COLUMN code_postal;
        RAISE NOTICE 'Colonne code_postal supprimée.';
    END IF;

    -- Supprimer ville (non utilisé dans le formulaire)
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mariage_parfait_contact_submissions' 
        AND column_name = 'ville'
    ) THEN
        ALTER TABLE mariage_parfait_contact_submissions DROP COLUMN ville;
        RAISE NOTICE 'Colonne ville supprimée.';
    END IF;
END $$;
*/

-- 4. Configurer RLS (Row Level Security) pour permettre l'insertion publique
-- Désactiver RLS temporairement ou créer des politiques appropriées

-- Option A: Désactiver RLS (si vous voulez permettre l'accès public complet)
-- ALTER TABLE mariage_parfait_contact_submissions DISABLE ROW LEVEL SECURITY;

-- Option B: Activer RLS et créer des politiques (recommandé)
ALTER TABLE mariage_parfait_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public insert on contact submissions" ON mariage_parfait_contact_submissions;
DROP POLICY IF EXISTS "Allow public to insert contact submissions" ON mariage_parfait_contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON mariage_parfait_contact_submissions;

-- Créer une politique pour permettre l'insertion publique (formulaire de contact)
CREATE POLICY "Allow public to insert contact submissions"
ON mariage_parfait_contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Créer une politique pour permettre la lecture aux admins uniquement (optionnel)
-- Décommentez si vous voulez que seuls les admins puissent voir les soumissions
/*
DROP POLICY IF EXISTS "Admins can view contact submissions" ON mariage_parfait_contact_submissions;

CREATE POLICY "Admins can view contact submissions"
ON mariage_parfait_contact_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
         OR auth.users.raw_user_meta_data->>'role' = 'super_admin')
  )
);
*/

-- 5. Vérification finale : Afficher la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'mariage_parfait_contact_submissions'
ORDER BY ordinal_position;

