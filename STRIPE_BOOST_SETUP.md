# Configuration Stripe pour la Mise en Avant

## 📋 Variables d'environnement nécessaires

Pour le système de mise en avant (boost), vous avez besoin d'un seul price ID Stripe qui sera utilisé pour les 3 offres (1 fiche, 5 fiches, 10 fiches).

### Option 1 : Utiliser STRIPE_PRICE_ID existant (recommandé)

Si vous avez déjà `STRIPE_PRICE_ID` dans votre `.env.local`, le code l'utilisera automatiquement.

```env
STRIPE_PRICE_ID=price_xxxxx
```

### Option 2 : Créer une variable dédiée STRIPE_BOOST_PRICE_ID

Si vous préférez avoir une variable séparée pour le boost, ajoutez :

```env
STRIPE_BOOST_PRICE_ID=price_xxxxx
```

**Note** : Si `STRIPE_BOOST_PRICE_ID` n'est pas défini, le système utilisera automatiquement `STRIPE_PRICE_ID` en fallback.

## 🎯 Comment ça fonctionne

Le système utilise **un seul price ID Stripe** pour les 3 offres :
- **1 fiche** : 9.99€/mois
- **5 fiches** : 19.99€/mois  
- **10 fiches** : 24.99€/mois

Le choix du plan (1, 5 ou 10 fiches) est stocké dans les metadata de la session Stripe et sauvegardé dans la colonne `max_boosted_listings` de la table `subscriptions`.

## ✅ Checklist

- [ ] Variable `STRIPE_PRICE_ID` définie dans `.env.local` (ou `STRIPE_BOOST_PRICE_ID`)
- [ ] Script SQL `supabase/add_max_boosted_listings.sql` exécuté dans Supabase
- [ ] Redémarrer le serveur après modification des variables d'environnement

