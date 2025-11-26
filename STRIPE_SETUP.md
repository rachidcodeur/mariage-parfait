# Configuration Stripe - Guide Complet

Ce guide vous explique comment configurer Stripe pour le système d'abonnement mensuel à 9,99€.

## 📋 Étapes de Configuration

### 1. Créer un compte Stripe

1. Allez sur [https://stripe.com](https://stripe.com)
2. Créez un compte (ou connectez-vous si vous en avez déjà un)
3. Activez votre compte en complétant les informations requises

### 2. Récupérer les clés API Stripe

1. Dans le dashboard Stripe, allez dans **Developers** → **API keys**
2. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_` ou `pk_live_`)
   - **Secret key** (commence par `sk_test_` ou `sk_live_`)

⚠️ **Important** : Utilisez les clés de **test** (`_test_`) pour le développement et les clés **live** (`_live_`) pour la production.

### 3. Créer le produit et le prix dans Stripe

⚠️ **IMPORTANT** : Assurez-vous d'être en mode **Test** (toggle en haut à droite du dashboard Stripe doit afficher "Test mode")

1. Dans le dashboard Stripe, allez dans **Products** → **Add product**
2. Remplissez les informations :
   - **Name** : "Abonnement Mensuel - Mariage Parfait"
   - **Description** : "Abonnement mensuel permettant de créer et publier des fiches"
   - **Pricing** :
     - **Price** : 9.99
     - **Currency** : EUR
     - **Billing period** : Monthly (recurring)
     - **Recurring** : Monthly
3. Cliquez sur **Save product**
4. **Copiez l'ID du prix** (commence par `price_...`) - vous en aurez besoin pour la configuration

⚠️ **Note importante** : 
- Les prix créés en mode **Test** ont des IDs différents de ceux créés en mode **Live**
- Si vous utilisez des clés de test (`pk_test_...` et `sk_test_...`), vous DEVEZ utiliser un prix créé en mode test
- Si vous utilisez des clés live (`pk_live_...` et `sk_live_...`), vous DEVEZ utiliser un prix créé en mode live
- Ne mélangez jamais les modes : clés test + prix live = erreur, clés live + prix test = erreur

### 4. Configurer le Webhook Stripe

1. Dans le dashboard Stripe, allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. Configurez l'endpoint :
   - **Endpoint URL** : `https://votre-domaine.com/api/stripe/webhook`
     - Pour le développement local, utilisez un outil comme [ngrok](https://ngrok.com) pour exposer votre serveur local
     - Exemple avec ngrok : `https://abc123.ngrok.io/api/stripe/webhook`
   - **Description** : "Webhook pour les abonnements Mariage Parfait"
   - **Events to send** : Sélectionnez ces événements :
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Cliquez sur **Add endpoint**
5. **Copiez le Signing secret** (commence par `whsec_...`) - vous en aurez besoin pour la configuration

### 5. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_... (ou sk_live_... pour la production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_... pour la production)
STRIPE_PRICE_ID=price_... (l'ID du prix créé à l'étape 3)
STRIPE_WEBHOOK_SECRET=whsec_... (le secret du webhook créé à l'étape 4)
```

### 6. Créer la table subscriptions dans Supabase

1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL
3. Copiez-collez le contenu du fichier `supabase/subscriptions.sql`
4. Exécutez le script

### 7. Installer les dépendances

Exécutez cette commande dans votre terminal :

```bash
npm install
```

Cela installera :
- `stripe` : SDK Stripe côté serveur
- `@stripe/stripe-js` : SDK Stripe côté client

### 8. Tester le système

#### En mode test (développement)

1. Utilisez les cartes de test Stripe :
   - **Carte valide** : `4242 4242 4242 4242`
   - **Date d'expiration** : N'importe quelle date future (ex: 12/34)
   - **CVC** : N'importe quel code à 3 chiffres (ex: 123)
   - **Code postal** : N'importe quel code postal (ex: 75001)

2. Testez le flux complet :
   - Connectez-vous à votre compte
   - Allez sur `/dashboard/abonnement`
   - Cliquez sur "S'abonner maintenant"
   - Utilisez une carte de test
   - Vérifiez que l'abonnement est créé dans Stripe et dans Supabase

#### Vérifier que tout fonctionne

1. **Vérifier la création d'abonnement** :
   - Créez un abonnement avec une carte de test
   - Vérifiez dans Stripe Dashboard → Customers qu'un customer a été créé
   - Vérifiez dans Stripe Dashboard → Subscriptions qu'un abonnement a été créé
   - Vérifiez dans Supabase que la table `subscriptions` contient l'abonnement

2. **Vérifier le webhook** :
   - Dans Stripe Dashboard → Webhooks, vérifiez que les événements sont bien reçus
   - Les événements doivent avoir le statut "Succeeded" (vert)

3. **Vérifier la création de fiche** :
   - Avec un abonnement actif, essayez de créer une fiche
   - Sans abonnement, vous devriez être redirigé vers la page d'abonnement

### 9. Passer en production

Quand vous êtes prêt pour la production :

1. **Activez votre compte Stripe en mode live** :
   - Complétez toutes les informations requises dans Stripe
   - Ajoutez vos informations bancaires pour recevoir les paiements

2. **Créez le produit et le prix en mode live** :
   - Répétez l'étape 3 mais cette fois en mode live
   - Notez le nouvel ID du prix

3. **Créez le webhook en mode live** :
   - Répétez l'étape 4 mais cette fois avec votre URL de production
   - Notez le nouveau secret du webhook

4. **Mettez à jour les variables d'environnement** :
   - Remplacez les clés de test par les clés live
   - Remplacez l'ID du prix de test par l'ID du prix live
   - Remplacez le secret du webhook de test par le secret du webhook live

5. **Redéployez votre application**

## 🔍 Dépannage

### Le webhook ne fonctionne pas

- Vérifiez que l'URL du webhook est correcte et accessible
- Vérifiez que le secret du webhook est correct dans `.env.local`
- Vérifiez les logs dans Stripe Dashboard → Webhooks pour voir les erreurs

### L'abonnement n'est pas créé dans Supabase

- Vérifiez que la table `subscriptions` existe dans Supabase
- Vérifiez que les politiques RLS sont correctement configurées
- Vérifiez les logs du serveur pour voir les erreurs

### Erreur "STRIPE_SECRET_KEY is not set"

- Vérifiez que toutes les variables d'environnement sont définies dans `.env.local`
- Redémarrez votre serveur de développement après avoir ajouté les variables

### Erreur lors du checkout

- Vérifiez que `STRIPE_PRICE_ID` est correct
- Vérifiez que le prix existe dans Stripe
- Vérifiez que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est correct

## 📝 Notes Importantes

- **Mode test vs production** : Les clés de test et de production sont différentes. Assurez-vous d'utiliser les bonnes clés selon l'environnement.
- **Webhooks en développement** : Pour tester les webhooks en local, utilisez [ngrok](https://ngrok.com) ou un service similaire.
- **Sécurité** : Ne partagez jamais vos clés secrètes Stripe. Elles doivent rester dans `.env.local` et ne jamais être commitées dans Git.

## 🎯 Résumé des fichiers créés

- `supabase/subscriptions.sql` : Script SQL pour créer la table subscriptions
- `lib/stripe.ts` : Configuration Stripe
- `lib/subscription.ts` : Fonctions utilitaires pour gérer les abonnements
- `app/api/stripe/create-checkout-session/route.ts` : Créer une session de checkout
- `app/api/stripe/webhook/route.ts` : Gérer les événements Stripe
- `app/api/stripe/get-subscription/route.ts` : Récupérer l'abonnement d'un utilisateur
- `app/api/stripe/cancel-subscription/route.ts` : Annuler un abonnement
- `app/api/stripe/resume-subscription/route.ts` : Reprendre un abonnement
- `app/dashboard/abonnement/page.tsx` : Page de gestion d'abonnement
- Modifications dans `app/dashboard/fiches/nouvelle/page.tsx` : Vérification d'abonnement avant création

## ✅ Checklist de Configuration

- [ ] Compte Stripe créé et activé
- [ ] Clés API récupérées (test et production)
- [ ] Produit et prix créés dans Stripe
- [ ] Webhook configuré dans Stripe
- [ ] Variables d'environnement configurées
- [ ] Table `subscriptions` créée dans Supabase
- [ ] Dépendances installées (`npm install`)
- [ ] Testé avec une carte de test
- [ ] Webhook testé et fonctionnel
- [ ] Vérifié que la création de fiche nécessite un abonnement

Une fois toutes ces étapes complétées, votre système d'abonnement Stripe sera opérationnel ! 🎉

