-- Script pour ajouter la colonne max_boosted_listings à la table subscriptions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter la colonne max_boosted_listings si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'max_boosted_listings'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN max_boosted_listings INTEGER DEFAULT 0;
        RAISE NOTICE 'Colonne max_boosted_listings ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne max_boosted_listings existe déjà.';
    END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_max_boosted_listings ON subscriptions(max_boosted_listings);

-- Afficher un résumé
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
AND column_name = 'max_boosted_listings';

