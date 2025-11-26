-- Script pour retirer toutes les fiches premium mises en test
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Étape 1: Afficher le nombre de fiches premium avant la mise à jour
SELECT 
    COUNT(*) as fiches_premium_avant,
    COUNT(CASE WHEN is_boosted = true THEN 1 END) as fiches_boostees_avant,
    COUNT(CASE WHEN is_boosted IS NULL THEN 1 END) as fiches_null_avant
FROM providers;

-- Étape 2: Mettre is_boosted à false pour TOUTES les fiches (y compris NULL)
-- Cela garantit qu'aucune fiche n'est en premium par défaut
UPDATE providers
SET is_boosted = false
WHERE is_boosted = true OR is_boosted IS NULL;

-- Étape 3: Vérifier le résultat après la mise à jour
SELECT 
    COUNT(*) as total_fiches,
    COUNT(CASE WHEN is_boosted = true THEN 1 END) as fiches_boostees_apres,
    COUNT(CASE WHEN is_boosted = false THEN 1 END) as fiches_non_boostees_apres,
    COUNT(CASE WHEN is_boosted IS NULL THEN 1 END) as fiches_null_apres
FROM providers;

-- Étape 4: Afficher un message de confirmation
DO $$
DECLARE
    boosted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO boosted_count
    FROM providers
    WHERE is_boosted = true;
    
    IF boosted_count = 0 THEN
        RAISE NOTICE '✅ Succès : Toutes les fiches premium ont été retirées. Aucune fiche n''est maintenant en premium.';
    ELSE
        RAISE WARNING '⚠️ Attention : Il reste % fiche(s) en premium.', boosted_count;
    END IF;
END $$;

