# Configuration SEO - Référencement des Articles et Fiches

## ✅ Ce qui a été mis en place

### 1. Sitemap XML Dynamique (`/sitemap.xml`)

Un sitemap automatique qui inclut :
- ✅ Toutes les pages statiques (accueil, blog, annuaire, contact, FAQ)
- ✅ Tous les articles de blog avec leurs dates de mise à jour
- ✅ Toutes les fiches de prestataires actives
- ✅ Toutes les pages de catégories de blog

**Fichier** : `app/sitemap.ts`

Le sitemap est généré automatiquement et mis à jour à chaque requête.

### 2. Robots.txt (`/robots.txt`)

Configuration optimisée pour les moteurs de recherche :
- ✅ Autorise tous les crawlers sur les pages publiques
- ✅ Bloque l'indexation des routes API, dashboard, espace-pro, admin
- ✅ Pointe vers le sitemap

**Fichier** : `app/robots.ts`

### 3. Meta Tags SEO pour les Articles

Chaque article de blog a maintenant :
- ✅ Titre optimisé avec le nom du site
- ✅ Meta description (utilise `meta_description` ou `excerpt`)
- ✅ Keywords
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ URL canonique
- ✅ Instructions robots optimisées

**Fichier** : `app/blog/[slug]/page.tsx` - fonction `generateMetadata`

### 4. Meta Tags SEO pour les Fiches de Prestataires

Chaque fiche de prestataire a maintenant :
- ✅ Titre optimisé avec le nom et la catégorie
- ✅ Meta description (utilise `summary` ou `description`)
- ✅ Keywords dynamiques (nom, catégorie, localisation)
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ URL canonique
- ✅ Instructions robots optimisées

**Fichier** : `app/annuaire/prestataire/[slug]/page.tsx` - fonction `generateMetadata`

### 5. Données Structurées JSON-LD

#### Pour les Articles (BlogPosting)
- ✅ Type : `BlogPosting`
- ✅ Titre, description, image
- ✅ Dates de publication et modification
- ✅ Auteur (Mariage Parfait)
- ✅ Section (catégorie)
- ✅ Keywords
- ✅ Nombre de mots

#### Pour les Fiches (LocalBusiness)
- ✅ Type : `LocalBusiness`
- ✅ Nom, description, image
- ✅ Coordonnées (téléphone, email, adresse)
- ✅ Géolocalisation (latitude/longitude si disponible)
- ✅ Avis Google (rating et nombre d'avis)
- ✅ Réseaux sociaux (sameAs)
- ✅ Zone de service (France)

## 🔧 Configuration Requise

### Variable d'Environnement

Ajoutez dans votre `.env.local` (développement) et dans votre plateforme de déploiement (production) :

```env
NEXT_PUBLIC_SITE_URL=https://mariage-parfait.net
```

**Important** :
- En développement : `http://localhost:3000`
- En production : votre domaine réel (ex: `https://mariage-parfait.net`)

### Configuration Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez `NEXT_PUBLIC_SITE_URL` avec votre URL de production
3. Sélectionnez **Production** comme environnement
4. Redéployez votre application

## 📊 Vérification

### 1. Vérifier le Sitemap

Une fois déployé, vérifiez que le sitemap est accessible :
```
https://votre-domaine.com/sitemap.xml
```

### 2. Vérifier le Robots.txt

```
https://votre-domaine.com/robots.txt
```

### 3. Vérifier les Meta Tags

Utilisez ces outils pour vérifier les meta tags :
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### 4. Vérifier les Données Structurées

Utilisez le [Google Rich Results Test](https://search.google.com/test/rich-results) pour vérifier que les données structurées JSON-LD sont correctement détectées.

## 🚀 Soumission aux Moteurs de Recherche

### Google Search Console

1. Créez un compte sur [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre propriété (votre domaine)
3. Vérifiez la propriété (via fichier HTML ou DNS)
4. Soumettez votre sitemap : `https://votre-domaine.com/sitemap.xml`

### Bing Webmaster Tools

1. Créez un compte sur [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Ajoutez votre site
3. Vérifiez la propriété
4. Soumettez votre sitemap

## 📈 Optimisations Supplémentaires Recommandées

### 1. Images

- ✅ Utilisez des images optimisées (WebP, compression)
- ✅ Ajoutez des attributs `alt` descriptifs
- ✅ Utilisez des images de bonne qualité pour les Open Graph (1200x630px)

### 2. Performance

- ✅ Optimisez le temps de chargement
- ✅ Utilisez le lazy loading pour les images
- ✅ Minimisez le JavaScript et CSS

### 3. Contenu

- ✅ Assurez-vous que les articles ont au moins 1500 mots
- ✅ Utilisez des titres structurés (H1, H2, H3)
- ✅ Ajoutez des liens internes entre les articles
- ✅ Créez du contenu régulièrement

### 4. Liens Internes

- ✅ Créez des liens entre articles similaires
- ✅ Créez des liens depuis la page d'accueil vers les articles
- ✅ Créez des liens depuis les articles vers l'annuaire

## 🔍 Monitoring

### Google Search Console

Surveillez régulièrement :
- Indexation des pages
- Performances de recherche
- Erreurs d'exploration
- Requêtes de recherche

### Analytics

Configurez Google Analytics pour suivre :
- Trafic organique
- Pages les plus visitées
- Taux de rebond
- Temps sur la page

## ⚠️ Notes Importantes

1. **Indexation** : L'indexation par Google peut prendre plusieurs jours à plusieurs semaines
2. **Sitemap** : Le sitemap est régénéré à chaque requête, donc toujours à jour
3. **Données structurées** : Les données JSON-LD sont injectées dans chaque page
4. **Canonical URLs** : Toutes les pages ont une URL canonique pour éviter le contenu dupliqué

## 📝 Checklist de Déploiement

Avant de déployer en production :

- [ ] Variable `NEXT_PUBLIC_SITE_URL` configurée avec l'URL de production
- [ ] Sitemap accessible à `/sitemap.xml`
- [ ] Robots.txt accessible à `/robots.txt`
- [ ] Meta tags vérifiés sur une page d'article
- [ ] Meta tags vérifiés sur une page de fiche
- [ ] Données structurées vérifiées avec Google Rich Results Test
- [ ] Sitemap soumis à Google Search Console
- [ ] Sitemap soumis à Bing Webmaster Tools

## 🎯 Résultat Attendu

Après quelques semaines, vous devriez voir :
- ✅ Vos articles indexés dans Google
- ✅ Vos fiches de prestataires indexées
- ✅ Apparition dans les résultats de recherche Google
- ✅ Meilleur référencement pour les mots-clés ciblés
- ✅ Apparition dans Google My Business (pour les fiches avec adresse)

