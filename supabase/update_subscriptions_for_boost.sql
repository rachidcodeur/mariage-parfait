-- Script pour mettre à jour la table subscriptions pour permettre plusieurs abonnements par utilisateur
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Supprimer la contrainte UNIQUE sur user_id pour permettre plusieurs abonnements
DO $$
BEGIN
    -- Vérifier si la contrainte existe
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscriptions_user_id_key'
    ) THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_key;
        RAISE NOTICE 'Contrainte UNIQUE sur user_id supprimée.';
    ELSE
        RAISE NOTICE 'Aucune contrainte UNIQUE sur user_id trouvée.';
    END IF;
END $$;

-- Ajouter une contrainte UNIQUE sur (user_id, subscription_type) pour permettre un abonnement de chaque type par utilisateur
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscriptions_user_id_type_key'
    ) THEN
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_type_key UNIQUE (user_id, subscription_type);
        RAISE NOTICE 'Contrainte UNIQUE sur (user_id, subscription_type) ajoutée.';
    ELSE
        RAISE NOTICE 'La contrainte UNIQUE sur (user_id, subscription_type) existe déjà.';
    END IF;
END $$;

-- Vérifier la structure
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.subscriptions'::regclass
AND conname LIKE '%user_id%';

