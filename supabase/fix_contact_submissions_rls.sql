-- Script rapide pour corriger le problème RLS sur mariage_parfait_contact_submissions
-- Exécutez ce script dans l'éditeur SQL de Supabase pour permettre l'insertion publique

-- 1. Activer RLS (si ce n'est pas déjà fait)
ALTER TABLE mariage_parfait_contact_submissions ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques qui pourraient bloquer l'insertion
DROP POLICY IF EXISTS "Allow public insert on contact submissions" ON mariage_parfait_contact_submissions;
DROP POLICY IF EXISTS "Allow public to insert contact submissions" ON mariage_parfait_contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON mariage_parfait_contact_submissions;

-- 3. Créer une politique pour permettre l'insertion publique
-- Cette politique permet à n'importe qui (même non authentifié) d'insérer des données
CREATE POLICY "Allow public to insert contact submissions"
ON mariage_parfait_contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Vérifier que la politique a été créée
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'mariage_parfait_contact_submissions';

