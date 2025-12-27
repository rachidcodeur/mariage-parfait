# Configuration des Variables d'Environnement sur Vercel

## ⚠️ Problème

Le fichier `.env.local` fonctionne **uniquement en développement local**. En production sur Vercel, les variables d'environnement doivent être configurées dans l'interface Vercel.

## ✅ Solution : Configurer les variables sur Vercel

### Étape 1 : Accéder aux Variables d'Environnement

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Sélectionnez votre projet **Mariage Parfait**
3. Allez dans **Settings** (Paramètres)
4. Cliquez sur **Environment Variables** (Variables d'environnement) dans le menu de gauche

### Étape 2 : Ajouter les Variables Supabase

Ajoutez ces variables **une par une** :

#### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Key** : `NEXT_PUBLIC_SUPABASE_URL`
- **Value** : `https://ltylxkpzujydcrccsyol.supabase.co` (votre URL Supabase)
- **Environments** : Cochez **Production**, **Preview**, et **Development**

#### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Key** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value** : Votre clé anon (commence par `eyJhbGciOiJIUzIlNiIsInR5CCI6IkpXVCJ9...`)
- **Environments** : Cochez **Production**, **Preview**, et **Development**

#### 3. `SUPABASE_SERVICE_ROLE_KEY` ⚠️ IMPORTANT
- **Key** : `SUPABASE_SERVICE_ROLE_KEY`
- **Value** : Votre clé service_role (commence par `eyJhbGciOiJIUzIlNiIsInR5cCI6IkpXVCJ9...`)
- **Environments** : Cochez **Production**, **Preview**, et **Development**
- **Note** : Cette clé est critique pour le sitemap !

### Étape 3 : Vérifier les Autres Variables

Assurez-vous que ces variables sont aussi configurées :

- `NEXT_PUBLIC_SITE_URL` = `https://mariage-parfait.net`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` = `ca-pub-7361154423634016`
- `STRIPE_SECRET_KEY` = (votre clé Stripe live)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = (votre clé Stripe live)
- `STRIPE_WEBHOOK_SECRET` = (votre secret webhook)
- `STRIPE_PRICE_ID` = (votre price ID)
- Et toutes les autres variables nécessaires

### Étape 4 : Redéployer

**IMPORTANT** : Après avoir ajouté/modifié les variables :

1. Allez dans l'onglet **Deployments** (Déploiements)
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy** (Redéployer)
4. Ou créez un nouveau déploiement en poussant un commit

### Étape 5 : Vérifier

Après le redéploiement :

1. Attendez que le déploiement soit terminé (2-3 minutes)
2. Accédez à `https://mariage-parfait.net/sitemap.xml`
3. Vérifiez que le sitemap contient maintenant les articles et prestataires
4. Recherchez "blog/" dans le fichier (devrait trouver ~646 articles)
5. Recherchez "annuaire/prestataire/" (devrait trouver ~3995 prestataires)

## 🔍 Vérification Rapide

Pour vérifier si les variables sont bien configurées :

1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien présente
3. Vérifiez que l'environnement **Production** est coché
4. Si la variable existe mais que le sitemap ne fonctionne toujours pas, **redéployez**

## ⚠️ Erreurs Courantes

### Erreur : "Variables définies mais sitemap vide"
- **Cause** : Les variables sont peut-être définies uniquement pour Development/Preview
- **Solution** : Vérifiez que **Production** est coché pour toutes les variables

### Erreur : "Sitemap ne se charge pas"
- **Cause** : Le redéploiement n'a pas été effectué après l'ajout des variables
- **Solution** : Redéployez manuellement depuis l'interface Vercel

### Erreur : "Variables manquantes dans les logs"
- **Cause** : Les variables n'ont pas été correctement ajoutées
- **Solution** : Vérifiez l'orthographe exacte des noms de variables (sensible à la casse)

## 📝 Notes Importantes

- Les variables `NEXT_PUBLIC_*` sont accessibles côté client ET serveur
- Les variables sans `NEXT_PUBLIC_*` sont **uniquement** accessibles côté serveur
- `SUPABASE_SERVICE_ROLE_KEY` est une variable serveur (pas de `NEXT_PUBLIC_`)
- Ne partagez jamais vos clés publiquement
- Les variables sont chiffrées dans l'interface Vercel

