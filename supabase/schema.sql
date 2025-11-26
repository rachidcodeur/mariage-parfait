-- Table des articles pour le blog (structure réelle)
-- Note: Cette table existe déjà dans Supabase avec cette structure
-- Cette requête est fournie à titre de référence

-- Structure de la table articles :
-- id SERIAL PRIMARY KEY (ou INTEGER)
-- created_at TIMESTAMPTZ DEFAULT NOW()
-- title TEXT NOT NULL
-- slug TEXT UNIQUE NOT NULL
-- excerpt TEXT NOT NULL
-- content TEXT NOT NULL
-- image TEXT (peut être NULL)
-- category_id INTEGER NOT NULL (référence aux catégories)
-- author TEXT DEFAULT 'Rédaction Mariage Parfait'
-- meta_description TEXT
-- keywords TEXT
-- views INTEGER DEFAULT 0
-- likes INTEGER DEFAULT 0
-- read_time TEXT (format "3 min")
-- tsv TSVECTOR (pour la recherche full-text)

-- Index pour améliorer les performances (à créer si nécessaire)
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_tsv ON articles USING gin(tsv);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Permettre la lecture publique
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

-- Permettre l'insertion via l'API (avec la clé de service)
CREATE POLICY "Service role can insert articles" ON articles
    FOR INSERT WITH CHECK (true);

