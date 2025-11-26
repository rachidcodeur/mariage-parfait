# Mariage Parfait

Un blog moderne et complet pour l'organisation de mariages, avec un annuaire de prestataires et un tableau de bord pour les professionnels.

## 🚀 Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **React Icons** - Bibliothèque d'icônes
- **Supabase** - Base de données et backend

## 📦 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env.local` à la racine du projet :
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Structure du projet

```
mariage-parfait/
├── app/
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Page d'accueil
│   └── globals.css      # Styles globaux
├── components/
│   ├── Header.tsx       # En-tête avec navigation
│   ├── Footer.tsx       # Pied de page
│   ├── Hero.tsx         # Section hero
│   ├── CategoryCard.tsx # Carte de catégorie
│   ├── ArticleCard.tsx # Carte d'article
│   ├── Newsletter.tsx   # Formulaire newsletter
│   └── AdSense.tsx      # Composant Google AdSense
└── public/              # Fichiers statiques
```

## 🎨 Fonctionnalités

### Page d'accueil
- Section Hero avec image de fond
- Section "Préparer le plus beau jour de votre vie"
- Grille de catégories (12 catégories)
- Section statistiques
- Section prestataires
- Section guides
- Derniers articles avec sidebar (AdSense + Newsletter)
- Section CTA finale

### Composants
- **Header** : Navigation responsive avec logo et boutons d'inscription/connexion
- **Footer** : Liens de navigation, catégories blog, réseaux sociaux
- **Hero** : Section d'accueil avec image de fond et CTA
- **CategoryCard** : Carte pour chaque catégorie du blog
- **ArticleCard** : Carte pour afficher les articles
- **Newsletter** : Formulaire d'abonnement à la newsletter
- **AdSense** : Intégration Google AdSense

## 🔧 Configuration

### Supabase

1. Créez un projet Supabase sur [supabase.com](https://supabase.com)
2. Créez une table `articles` avec la structure suivante :
```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  read_time INTEGER DEFAULT 5,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
```
3. Récupérez votre URL et clé anonyme depuis les paramètres du projet
4. Ajoutez-les dans `.env.local`

### Google AdSense

1. Obtenez votre ID client AdSense depuis votre compte Google AdSense
2. Remplacez `ca-pub-XXXXXXXXXX` dans `.env.local` par votre ID client
3. Remplacez `1234567890` dans `components/AdSense.tsx` par votre ad slot ID
4. Le composant AdSense est déjà intégré dans la sidebar de la page d'accueil et entre les articles du blog

### Génération automatique d'articles

Le système génère automatiquement **1 article par jour** via un cron job.

**Pour Vercel :**
- Le fichier `vercel.json` est déjà configuré pour exécuter `/api/articles/generate` tous les jours à minuit
- Assurez-vous que votre projet est déployé sur Vercel

**Pour d'autres plateformes :**
- Configurez un cron job qui appelle `POST /api/articles/generate` tous les jours à minuit (00:00 UTC)
- Vous pouvez aussi appeler manuellement cette route pour générer un article

## 📝 Fonctionnalités

### ✅ Implémenté
- [x] Page d'accueil complète
- [x] Page Annuaire avec régions et départements
- [x] Page Contact avec formulaire
- [x] Page Blog avec catégories et recherche
- [x] Page Espace Pro (inscription/connexion)
- [x] Intégration Supabase pour les articles
- [x] Génération automatique d'articles (1 par jour)
- [x] Pagination des articles
- [x] Publicités Google AdSense

### 🔄 À venir
- [ ] Pages de détail des articles
- [ ] Pages de détail des prestataires
- [ ] Tableau de bord pour prestataires
- [ ] Système d'authentification complet
- [ ] Pages FAQ

## 🚢 Déploiement

Le projet peut être déployé sur Vercel, Netlify ou tout autre hébergeur supportant Next.js.

```bash
npm run build
npm start
```

## 📄 Licence

Tous droits réservés © 2024 Mariage-Parfait.net

