# Guide d'activation de Google AdSense

Ce guide vous explique comment activer Google AdSense sur votre site Mariage Parfait.

## 📋 Prérequis

1. Avoir un compte Google
- Créer un compte Google AdSense sur [https://www.google.com/adsense/](https://www.google.com/adsense/)
- Votre site doit être en ligne et accessible publiquement pour être approuvé par Google

## 🔑 Étape 1 : Obtenir votre Publisher ID (Client ID)

1. Connectez-vous à votre compte Google AdSense : [https://www.google.com/adsense/](https://www.google.com/adsense/)
2. Allez dans **Paramètres** > **Compte**
3. Trouvez votre **Publisher ID** (format : `ca-pub-XXXXXXXXXX`)
4. Copiez cet ID

## 📍 Étape 2 : Créer des unités publicitaires (Ad Slots)

Pour chaque emplacement publicitaire sur votre site, vous devez créer une unité publicitaire :

1. Dans AdSense, allez dans **Annonces** > **Par unité publicitaire**
2. Cliquez sur **+ Nouvelle unité publicitaire**
3. Choisissez le type d'annonce :
   - **Affichage** : Pour les annonces dans le contenu (recommandé)
   - **In-article** : Pour les annonces entre les articles
   - **In-feed** : Pour les annonces dans les flux
4. Donnez un nom à votre unité (ex: "Sidebar Blog", "Entre Articles", "Page Article")
5. Choisissez la taille :
   - **Responsive** : S'adapte automatiquement (recommandé)
   - **Taille fixe** : Si vous préférez une taille spécifique
6. Cliquez sur **Créer**
7. **Copiez l'ID de l'unité publicitaire** (format : `1234567890`)

### Unités publicitaires recommandées pour votre site :

1. **Sidebar Blog** (page d'accueil et blog)
   - Type : Affichage
   - Taille : Responsive
   - Emplacement : Sidebar droite sur la page blog

2. **Entre Articles** (page blog)
   - Type : In-article ou Affichage
   - Taille : Responsive
   - Emplacement : Entre les articles (tous les 9 articles)

3. **Page Article** (détail d'article)
   - Type : In-article ou Affichage
   - Taille : Responsive
   - Emplacement : Au milieu du contenu de l'article

## ⚙️ Étape 3 : Configuration dans votre projet

### 1. Créer le fichier `.env.local`

À la racine de votre projet, créez un fichier `.env.local` (s'il n'existe pas déjà) :

```env
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-VOTRE_ID_ICI

# Supabase Configuration (si pas déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_supabase
```

**Remplacez `ca-pub-VOTRE_ID_ICI` par votre Publisher ID obtenu à l'étape 1.**

### 2. Mettre à jour les Ad Slots dans le code

Vous devez remplacer les placeholders `1234567890` par vos vrais IDs d'unités publicitaires :

#### a) Page d'accueil (`app/page.tsx`)
```typescript
<AdSense adSlot="VOTRE_ID_SIDEBAR" />
```

#### b) Page Blog (`app/blog/page.tsx`)
```typescript
<AdSense adSlot="VOTRE_ID_ENTRE_ARTICLES" />
```

#### c) Page Article (`app/blog/[slug]/page.tsx`)
```typescript
<AdSense adSlot="VOTRE_ID_PAGE_ARTICLE" />
```

## 🚀 Étape 4 : Déployer et tester

1. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Vérifier que les variables d'environnement sont chargées** :
   - Les annonces AdSense devraient apparaître sur votre site
   - Si vous voyez des espaces vides, c'est normal pendant la période d'approbation

3. **Déployer sur votre hébergeur** :
   - Assurez-vous d'ajouter les variables d'environnement dans les paramètres de votre hébergeur
   - Pour Vercel : Allez dans **Settings** > **Environment Variables**
   - Ajoutez `NEXT_PUBLIC_ADSENSE_CLIENT_ID` avec votre Publisher ID

## ✅ Étape 5 : Soumettre votre site à AdSense

1. Dans AdSense, allez dans **Sites**
2. Cliquez sur **+ Ajouter un site**
3. Entrez l'URL de votre site (ex: `https://mariage-parfait.net`)
4. Suivez les instructions pour ajouter le code de vérification
5. Attendez l'approbation de Google (peut prendre quelques jours à quelques semaines)

## 🔍 Vérification

Une fois approuvé, vous devriez voir :
- Des annonces réelles s'afficher sur votre site
- Des statistiques dans votre tableau de bord AdSense
- Des revenus générés (selon le trafic)

## ⚠️ Notes importantes

1. **Pendant la période d'approbation** :
   - Les espaces publicitaires peuvent rester vides
   - C'est normal, Google teste votre site

2. **Respect des politiques AdSense** :
   - Ne cliquez pas sur vos propres annonces
   - Assurez-vous que votre contenu respecte les politiques AdSense
   - Évitez le contenu trompeur ou de mauvaise qualité

3. **Performance** :
   - Les annonces sont chargées de manière asynchrone pour ne pas ralentir le site
   - Le composant AdSense utilise `strategy="afterInteractive"` pour optimiser le chargement

## 📞 Support

Si vous rencontrez des problèmes :
- Documentation AdSense : [https://support.google.com/adsense](https://support.google.com/adsense)
- Vérifiez que votre Publisher ID est correct dans `.env.local`
- Vérifiez que les Ad Slot IDs sont corrects dans le code
- Assurez-vous que votre site est accessible publiquement

