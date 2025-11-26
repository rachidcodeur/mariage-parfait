# Dépannage Stripe - Guide Rapide

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

### Le webhook ne fonctionne pas
- Vérifiez que l'URL du webhook est correcte et accessible
- Pour le développement local, utilisez [ngrok](https://ngrok.com) pour exposer votre serveur
- Vérifiez que le secret du webhook est correct dans `.env.local`

