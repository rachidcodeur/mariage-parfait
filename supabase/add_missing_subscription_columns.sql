-- Script pour ajouter les colonnes manquantes à la table subscriptions
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Vérifier et ajouter la colonne cancel_at_period_end si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'cancel_at_period_end'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne cancel_at_period_end ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne cancel_at_period_end existe déjà.';
    END IF;
END $$;

-- Vérifier et ajouter la colonne stripe_price_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'stripe_price_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_price_id TEXT;
        RAISE NOTICE 'Colonne stripe_price_id ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne stripe_price_id existe déjà.';
    END IF;
END $$;

-- Vérifier et ajouter la colonne canceled_at si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'canceled_at'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN canceled_at TIMESTAMPTZ;
        RAISE NOTICE 'Colonne canceled_at ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne canceled_at existe déjà.';
    END IF;
END $$;

-- Vérifier et ajouter la colonne current_period_start si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'current_period_start'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMPTZ;
        RAISE NOTICE 'Colonne current_period_start ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne current_period_start existe déjà.';
    END IF;
END $$;

-- Vérifier et ajouter la colonne current_period_end si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'current_period_end'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
        RAISE NOTICE 'Colonne current_period_end ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne current_period_end existe déjà.';
    END IF;
END $$;

-- Vérifier et ajouter la colonne updated_at si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée avec succès.';
    ELSE
        RAISE NOTICE 'La colonne updated_at existe déjà.';
    END IF;
END $$;

-- Créer la fonction pour updated_at (si elle n'existe pas déjà)
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vérifier si le trigger pour updated_at existe, sinon le créer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'update_subscriptions_updated_at'
    ) THEN
        -- Créer le trigger
        EXECUTE 'CREATE TRIGGER update_subscriptions_updated_at
          BEFORE UPDATE ON subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_subscriptions_updated_at()';
        
        RAISE NOTICE 'Trigger update_subscriptions_updated_at créé avec succès.';
    ELSE
        RAISE NOTICE 'Le trigger update_subscriptions_updated_at existe déjà.';
    END IF;
END $$;

-- Afficher un résumé de la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
ORDER BY ordinal_position;

