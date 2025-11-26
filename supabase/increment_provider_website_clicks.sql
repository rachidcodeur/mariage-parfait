-- Fonction RPC pour incrémenter les clics site web d'un prestataire
CREATE OR REPLACE FUNCTION increment_provider_website_clicks(provider_id_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
  new_clicks INTEGER;
BEGIN
  UPDATE public.providers
  SET website_clicks = COALESCE(website_clicks, 0) + 1
  WHERE id = provider_id_param
  RETURNING website_clicks INTO new_clicks;
  
  RETURN COALESCE(new_clicks, 0);
END;
$$ LANGUAGE plpgsql;

-- Pour permettre l'exécution par l'API (service_role_key)
GRANT EXECUTE ON FUNCTION public.increment_provider_website_clicks(BIGINT) TO service_role;

