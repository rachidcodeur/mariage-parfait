-- Table pour gérer les revendications de fiches par les utilisateurs
CREATE TABLE IF NOT EXISTS provider_claims (
  id BIGSERIAL PRIMARY KEY,
  provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider_id, user_id, status) -- Un utilisateur ne peut avoir qu'une revendication en attente par fiche
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_provider_claims_provider_id ON provider_claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_claims_user_id ON provider_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_claims_status ON provider_claims(status);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_provider_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_provider_claims_updated_at
  BEFORE UPDATE ON provider_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_claims_updated_at();

-- RLS (Row Level Security) - Les utilisateurs peuvent voir leurs propres revendications
ALTER TABLE provider_claims ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres revendications
CREATE POLICY "Users can view their own claims"
  ON provider_claims
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres revendications
CREATE POLICY "Users can create their own claims"
  ON provider_claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les admins peuvent voir toutes les revendications
CREATE POLICY "Admins can view all claims"
  ON provider_claims
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Politique : Les admins peuvent mettre à jour les revendications
CREATE POLICY "Admins can update claims"
  ON provider_claims
  FOR UPDATE
  USING (is_admin(auth.uid()));

