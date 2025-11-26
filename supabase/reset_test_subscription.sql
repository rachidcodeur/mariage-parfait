-- Script pour réinitialiser l'abonnement d'un compte test
-- Ce script supprime l'abonnement de l'utilisateur contact@ecomdev.io

-- 1. Trouver l'ID de l'utilisateur
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'contact@ecomdev.io';

    IF user_uuid IS NULL THEN
        RAISE NOTICE 'Utilisateur contact@ecomdev.io non trouvé';
    ELSE
        RAISE NOTICE 'Utilisateur trouvé: %', user_uuid;
        
        -- Supprimer l'abonnement de cet utilisateur
        DELETE FROM subscriptions
        WHERE user_id = user_uuid;
        
        RAISE NOTICE 'Abonnement supprimé pour contact@ecomdev.io';
    END IF;
END $$;

-- Vérification : Afficher tous les abonnements restants pour cet utilisateur
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.status,
    s.stripe_subscription_id,
    s.current_period_end
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'contact@ecomdev.io';

