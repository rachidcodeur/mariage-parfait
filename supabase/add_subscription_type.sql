-- Script pour ajouter la colonne subscription_type à la table subscriptions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter la colonne subscription_type si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'subscription_type'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN subscription_type TEXT DEFAULT 'listing' CHECK (subscription_type IN ('listing', 'boost'));
        RAISE NOTICE 'Colonne subscription_type ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne subscription_type existe déjà.';
    END IF;
END $$;

-- Mettre à jour les abonnements existants pour qu'ils soient de type 'listing' (ancien système)
UPDATE subscriptions 
SET subscription_type = 'listing' 
WHERE subscription_type IS NULL;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_type ON subscriptions(subscription_type);

-- Afficher un résumé
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
AND column_name = 'subscription_type';

