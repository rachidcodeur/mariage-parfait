# Dépannage Stripe - Guide Rapide

## Erreur : "Expired API Key provided: sk_live_..." ou "Expired API Key provided: sk_test_..."

### Problème
Votre clé API secrète Stripe a expiré ou a été révoquée. Cela peut arriver si :
- La clé a été régénérée dans le dashboard Stripe
- La clé a été supprimée pour des raisons de sécurité
- La clé a atteint sa date d'expiration (rare mais possible)

### Solution

1. **Connectez-vous à votre dashboard Stripe** :
   - Allez sur [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Connectez-vous avec votre compte

2. **Récupérez une nouvelle clé API secrète** :
   - Allez dans **Developers** → **API keys** (ou **Clés API** en français)
   - Vérifiez le mode (Test ou Live) en haut à droite du dashboard
   - Si vous êtes en **mode Test** :
     - Trouvez la section "Test mode keys"
     - Cliquez sur **"Reveal test key"** ou **"Révéler la clé de test"** pour voir la clé secrète
     - Si aucune clé n'existe, cliquez sur **"Create secret key"** ou **"Créer une clé secrète"**
   - Si vous êtes en **mode Live** :
     - Trouvez la section "Live mode keys"
     - Cliquez sur **"Reveal live key"** ou **"Révéler la clé live"** pour voir la clé secrète
     - Si aucune clé n'existe, cliquez sur **"Create secret key"** ou **"Créer une clé secrète"**

3. **Récupérez aussi la clé publique** :
   - Dans la même page, copiez la **Publishable key** (clé publique)
   - Elle commence par `pk_test_...` (mode test) ou `pk_live_...` (mode live)

4. **Mettez à jour votre fichier `.env.local`** :
   ```env
   # Remplacez les anciennes clés par les nouvelles
   STRIPE_SECRET_KEY=sk_test_... (ou sk_live_... pour la production)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_... pour la production)
   ```

5. **Si vous êtes en production (Vercel, Netlify, etc.)** :
   - Allez dans les paramètres de votre projet
   - Section "Environment Variables" ou "Variables d'environnement"
   - Mettez à jour `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` avec les nouvelles valeurs
   - Redéployez votre application

6. **Redémarrez votre serveur de développement** (si en local) :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

### ⚠️ Important
- **Ne partagez jamais vos clés secrètes** (`sk_test_...` ou `sk_live_...`)
- Les clés secrètes doivent rester dans `.env.local` et ne jamais être commitées dans Git
- Si vous avez accidentellement commité une clé secrète, régénérez-la immédiatement dans Stripe

### Vérification
Après avoir mis à jour les clés, testez à nouveau le paiement. L'erreur "Expired API Key" devrait disparaître.

---

## Erreur : "No such price: 'price_...'; a similar object exists in live mode, but a test mode key was used"

### Problème
Vous utilisez des clés Stripe en mode **test** mais avec un ID de prix créé en mode **live** (ou vice versa).

### Solution

1. **Vérifiez le mode Stripe** :
   - Dans le dashboard Stripe, regardez le toggle en haut à droite
   - Il doit afficher "Test mode" si vous utilisez des clés de test
   - Il doit afficher "Live mode" si vous utilisez des clés live

2. **Créez un nouveau prix dans le bon mode** :
   - Si vous êtes en mode **Test** :
     1. Allez dans **Products** → **Add product**
     2. Créez un nouveau produit "Abonnement Mensuel - Mariage Parfait"
     3. Prix : 9.99€, récurrent mensuel
     4. Copiez le nouvel ID du prix (commence par `price_...`)
   - Si vous êtes en mode **Live** :
     1. Activez le mode Live (toggle en haut à droite)
     2. Répétez les mêmes étapes

3. **Mettez à jour votre `.env.local`** :
   ```env
   STRIPE_PRICE_ID=price_... (le NOUVEL ID créé dans le bon mode)
   ```

4. **Redémarrez votre serveur de développement** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

### Vérification

Pour vérifier que tout est correct :
- Clés test (`pk_test_...`, `sk_test_...`) → Prix test (`price_...` créé en mode test)
- Clés live (`pk_live_...`, `sk_live_...`) → Prix live (`price_...` créé en mode live)

## Autres erreurs courantes

### Erreur : "STRIPE_SECRET_KEY is not set"
- Vérifiez que toutes les variables d'environnement sont définies dans `.env.local`
- Redémarrez le serveur après avoir ajouté les variables

### Erreur : "Invalid API Key"
- Vérifiez que vous avez copié les clés correctement
- Vérifiez que vous n'avez pas mélangé les clés test et live

### Erreur : "No such customer: 'cus_...'"

### Problème
Le `customer_id` stocké dans votre base de données n'existe plus dans Stripe. Cela peut arriver si :
- Le customer a été supprimé manuellement dans le dashboard Stripe
- Les clés API ont changé (passage de test à live ou vice versa)
- Le customer a été créé avec une autre clé API

### Solution

Le code a été mis à jour pour gérer automatiquement ce cas :
1. **Vérification automatique** : Le code vérifie maintenant si le customer existe dans Stripe avant de l'utiliser
2. **Recréation automatique** : Si le customer n'existe pas, un nouveau customer est créé automatiquement
3. **Mise à jour de la base** : Le nouveau `customer_id` est automatiquement sauvegardé dans la base de données

**Aucune action manuelle n'est nécessaire** - le système gère cela automatiquement lors de la prochaine tentative de paiement.

### Si le problème persiste

Si vous continuez à rencontrer cette erreur après la mise à jour du code :
1. Vérifiez que vous utilisez les bonnes clés API (test vs live)
2. Vérifiez dans le dashboard Stripe que vous êtes dans le bon mode
3. Redémarrez votre serveur pour appliquer les changements

---

### Le webhook ne fonctionne pas
- Vérifiez que l'URL du webhook est correcte et accessible
- Pour le développement local, utilisez [ngrok](https://ngrok.com) pour exposer votre serveur
- Vérifiez que le secret du webhook est correct dans `.env.local`

