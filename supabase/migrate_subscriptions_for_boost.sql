-- Script de migration complet pour la table subscriptions
-- Permet de gérer les abonnements de type 'boost' et 'listing'
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne subscription_type si elle n'existe pas
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

-- 2. Mettre à jour les abonnements existants pour qu'ils soient de type 'listing'
UPDATE subscriptions 
SET subscription_type = 'listing' 
WHERE subscription_type IS NULL;

-- 3. Ajouter la colonne max_boosted_listings si elle n'existe pas
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

-- 4. Supprimer l'ancienne contrainte UNIQUE sur user_id si elle existe
DO $$
BEGIN
    -- Vérifier si la contrainte existe (peut avoir différents noms selon la version de Postgres)
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.subscriptions'::regclass
        AND contype = 'u'
        AND array_length(conkey, 1) = 1
        AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.subscriptions'::regclass AND attname = 'user_id')
    ) THEN
        -- Trouver le nom exact de la contrainte
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT conname INTO constraint_name
            FROM pg_constraint 
            WHERE conrelid = 'public.subscriptions'::regclass
            AND contype = 'u'
            AND array_length(conkey, 1) = 1
            AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.subscriptions'::regclass AND attname = 'user_id');
            
            EXECUTE format('ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS %I', constraint_name);
            RAISE NOTICE 'Contrainte UNIQUE sur user_id supprimée: %', constraint_name;
        END;
    ELSE
        RAISE NOTICE 'Aucune contrainte UNIQUE sur user_id trouvée.';
    END IF;
END $$;

-- 5. Ajouter la nouvelle contrainte UNIQUE sur (user_id, subscription_type)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.subscriptions'::regclass
        AND conname = 'subscriptions_user_id_subscription_type_key'
    ) THEN
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_subscription_type_key UNIQUE (user_id, subscription_type);
        RAISE NOTICE 'Contrainte UNIQUE sur (user_id, subscription_type) ajoutée.';
    ELSE
        RAISE NOTICE 'La contrainte UNIQUE sur (user_id, subscription_type) existe déjà.';
    END IF;
END $$;

-- 6. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_type ON subscriptions(subscription_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_max_boosted_listings ON subscriptions(max_boosted_listings);

-- 7. Vérifier la structure finale
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.subscriptions'::regclass
AND contype = 'u'
ORDER BY conname;

-- 8. Afficher un résumé des colonnes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
AND column_name IN ('subscription_type', 'max_boosted_listings')
ORDER BY column_name;

