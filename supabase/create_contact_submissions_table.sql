-- Script pour créer/recréer la table mariage_parfait_contact_submissions
-- avec la structure correspondant au formulaire de contact
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Option 1: Si vous voulez garder les anciennes données, utilisez update_contact_submissions_table.sql
-- Option 2: Si vous voulez repartir de zéro, utilisez ce script (ATTENTION: supprime les données existantes)

-- ATTENTION: Ce script supprime la table existante et toutes ses données
-- Décommentez seulement si vous êtes sûr de vouloir supprimer les données existantes
/*
DROP TABLE IF EXISTS mariage_parfait_contact_submissions CASCADE;
*/
 
-- Créer la table avec la structure correspondant au formulaire
CREATE TABLE IF NOT EXISTS mariage_parfait_contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,                    -- Nom complet (remplace prenom + nom)
  email TEXT NOT NULL,                    -- Email
  request_type TEXT NOT NULL,             -- Type de demande (conseil, support, partenariat, question, autre)
  subject TEXT NOT NULL,                  -- Sujet du message
  message TEXT NOT NULL                   -- Message
);

-- Créer un index sur created_at pour améliorer les performances des requêtes de tri
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
ON mariage_parfait_contact_submissions(created_at DESC);

-- Créer un index sur email pour faciliter les recherches
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
ON mariage_parfait_contact_submissions(email);

-- RLS (Row Level Security) - Configuration pour permettre l'insertion publique
ALTER TABLE mariage_parfait_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Politique : Permettre l'insertion pour tous (formulaire public)
-- Cette politique permet à n'importe qui d'insérer des données via le formulaire
CREATE POLICY "Allow public to insert contact submissions"
ON mariage_parfait_contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Politique : Seuls les admins peuvent voir les soumissions (optionnel)
-- Décommentez si vous voulez restreindre la lecture aux admins uniquement
/*
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

-- Vérification : Afficher la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'mariage_parfait_contact_submissions'
ORDER BY ordinal_position;

