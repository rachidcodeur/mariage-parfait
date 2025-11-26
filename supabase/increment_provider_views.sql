-- Fonction SQL pour incrémenter les vues d'un prestataire de manière atomique
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Créer ou remplacer la fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_provider_views(provider_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_views INTEGER;
BEGIN
  -- Incrémenter les vues de manière atomique
  UPDATE providers
  SET views = COALESCE(views, 0) + 1
  WHERE id = provider_id
  RETURNING views INTO new_views;
  
  -- Retourner le nouveau nombre de vues
  RETURN COALESCE(new_views, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION increment_provider_views(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_provider_views(INTEGER) TO anon;

