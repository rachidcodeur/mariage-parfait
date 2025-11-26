-- Script pour configurer RLS sur mariage_parfait_newsletter_subscriptions
-- Exécutez ce script dans l'éditeur SQL de Supabase pour permettre l'insertion publique

-- 1. Activer RLS (si ce n'est pas déjà fait)
ALTER TABLE mariage_parfait_newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques qui pourraient bloquer l'insertion
DROP POLICY IF EXISTS "Allow public to insert newsletter subscriptions" ON mariage_parfait_newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow public insert on newsletter subscriptions" ON mariage_parfait_newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can insert newsletter subscriptions" ON mariage_parfait_newsletter_subscriptions;

-- 3. Créer une politique pour permettre l'insertion publique
CREATE POLICY "Allow public to insert newsletter subscriptions"
ON mariage_parfait_newsletter_subscriptions
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Optionnel : Créer une politique pour permettre la mise à jour (pour réactiver un abonnement)
DROP POLICY IF EXISTS "Allow public to update newsletter subscriptions" ON mariage_parfait_newsletter_subscriptions;

CREATE POLICY "Allow public to update newsletter subscriptions"
ON mariage_parfait_newsletter_subscriptions
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 5. Vérifier que les politiques ont été créées
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
WHERE tablename = 'mariage_parfait_newsletter_subscriptions';

