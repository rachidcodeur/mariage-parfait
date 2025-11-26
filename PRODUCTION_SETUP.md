# Configuration Production - Mariage Parfait

Ce guide vous aide à configurer votre application pour la production.

## ✅ Checklist de Préparation Production

### 1. Variables d'Environnement

Assurez-vous que toutes les variables suivantes sont configurées dans votre plateforme de déploiement (Vercel, Netlify, etc.) :

#### Supabase (Obligatoire)
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

#### Stripe (Obligatoire si vous utilisez les paiements)
```env
# ⚠️ IMPORTANT : Utilisez les clés LIVE en production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_... (créé en mode LIVE)
STRIPE_BOOST_PRICE_ID=price_... (créé en mode LIVE)
STRIPE_WEBHOOK_SECRET=whsec_... (secret du webhook de production)
```

#### Google AdSense (Obligatoire)
```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
```

#### Cron Jobs (Obligatoire pour la génération automatique d'articles)
```env
CRON_SECRET=votre_secret_aleatoire_securise
```

### 2. Routes Protégées

Les routes suivantes sont automatiquement désactivées en production :
- ✅ `/api/contact/debug` - Route de debug
- ✅ `/api/contact/test` - Route de test
- ✅ `/api/articles/generate` (GET) - Test de génération
- ✅ `/api/articles/generate-category` (GET) - Test de génération par catégorie

### 3. Configuration Stripe

#### Vérifier le Mode
1. Dans le dashboard Stripe, vérifiez que vous êtes en mode **Live**
2. Créez vos produits et prix en mode Live
3. Utilisez les clés Live (`pk_live_...` et `sk_live_...`)

#### Webhook de Production
1. Allez dans Stripe Dashboard → Developers → Webhooks
2. Ajoutez une nouvelle URL : `https://votre-domaine.com/api/stripe/webhook`
3. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiez le **Signing secret** et ajoutez-le à `STRIPE_WEBHOOK_SECRET`

### 4. Configuration AdSense

1. Vérifiez que votre site est **approuvé** par Google AdSense
2. Remplacez tous les Ad Slot IDs placeholder (`1234567890`) par vos vrais IDs :
   - `app/page.tsx`
   - `app/blog/page.tsx`
   - `app/blog/[slug]/page.tsx`
3. Vérifiez que `NEXT_PUBLIC_ADSENSE_CLIENT_ID` est configuré

### 5. Configuration Vercel (si applicable)

#### Cron Jobs
Le fichier `vercel.json` est déjà configuré pour générer des articles automatiquement :
- **Chemin** : `/api/articles/generate-daily`
- **Horaire** : Tous les jours à 2h00 UTC

**Note** : Les cron jobs Vercel nécessitent un plan Pro ou Enterprise. Pour les plans gratuits, utilisez un service externe comme :
- GitHub Actions
- EasyCron
- Cron-job.org

#### Variables d'Environnement
1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez toutes les variables listées ci-dessus
4. Sélectionnez **Production** comme environnement

### 6. Configuration Supabase

#### RLS (Row Level Security)
Vérifiez que toutes les politiques RLS sont correctement configurées :
- ✅ `mariage_parfait_contact_submissions` - Insertion publique autorisée
- ✅ `mariage_parfait_newsletter_subscriptions` - Insertion publique autorisée
- ✅ `provider_claims` - Les utilisateurs voient leurs propres revendications
- ✅ `subscriptions` - Les utilisateurs voient leurs propres abonnements

#### Email SMTP (Recommandé)
Pour la production, configurez un SMTP personnalisé :
1. Allez dans Supabase → Settings → Auth → SMTP Settings
2. Configurez votre serveur SMTP (Gmail, SendGrid, Mailgun, etc.)
3. Activez les emails de confirmation

### 7. Sécurité

#### Vérifications
- ✅ Les routes de debug sont désactivées en production
- ✅ Les messages d'erreur ne révèlent pas d'informations sensibles
- ✅ Les clés API ne sont jamais exposées côté client
- ✅ `SUPABASE_SERVICE_ROLE_KEY` est uniquement utilisé côté serveur

#### Recommandations
- Activez la protection DDoS sur votre hébergeur
- Configurez un CDN pour les assets statiques
- Activez HTTPS (généralement automatique sur Vercel/Netlify)
- Configurez des backups réguliers de votre base de données Supabase

### 8. Performance

#### Optimisations
- ✅ Images optimisées avec Next.js Image
- ✅ Code splitting automatique
- ✅ Minification en production
- ✅ Cache des assets statiques

#### Monitoring
Configurez un service de monitoring :
- Vercel Analytics (intégré)
- Sentry pour le tracking d'erreurs
- Google Analytics pour les statistiques

### 9. Tests Avant Déploiement

Avant de déployer en production, testez :

1. **Formulaire de contact** : Vérifiez que les soumissions fonctionnent
2. **Newsletter** : Testez l'abonnement
3. **Inscription/Connexion** : Vérifiez l'authentification
4. **Paiements Stripe** : Testez avec une carte de test en mode Live (utilisez les cartes de test Stripe)
5. **Génération d'articles** : Vérifiez que le cron job fonctionne
6. **AdSense** : Vérifiez que les publicités s'affichent

### 10. Déploiement

#### Vercel
```bash
# Build de test local
npm run build

# Si le build réussit, déployez
vercel --prod
```

#### Autres plateformes
```bash
npm run build
npm start
```

### 11. Post-Déploiement

Après le déploiement, vérifiez :

1. ✅ Le site charge correctement
2. ✅ Les formulaires fonctionnent
3. ✅ Les emails de confirmation sont envoyés
4. ✅ Les paiements Stripe fonctionnent
5. ✅ Les publicités AdSense s'affichent
6. ✅ Les cron jobs s'exécutent correctement

### 12. Support et Maintenance

#### Logs
- Vercel : Dashboard → Logs
- Supabase : Dashboard → Logs
- Stripe : Dashboard → Events

#### Mises à jour
- Testez toujours en local avant de déployer
- Utilisez des branches de développement
- Faites des backups réguliers

## 🚨 Problèmes Courants

### Les emails ne sont pas envoyés
- Vérifiez la configuration SMTP dans Supabase
- Vérifiez que les emails ne sont pas dans les spams

### Les paiements Stripe ne fonctionnent pas
- Vérifiez que vous utilisez les clés Live
- Vérifiez que les prix sont créés en mode Live
- Vérifiez la configuration du webhook

### Les publicités AdSense ne s'affichent pas
- Vérifiez que votre site est approuvé
- Vérifiez que les Ad Slot IDs sont corrects
- Attendez 24-48h après l'approbation

### Les cron jobs ne s'exécutent pas
- Vérifiez que vous avez un plan Vercel Pro/Enterprise
- Ou configurez un service externe de cron jobs

## 📞 Support

En cas de problème, consultez :
- Documentation Next.js : https://nextjs.org/docs
- Documentation Supabase : https://supabase.com/docs
- Documentation Stripe : https://stripe.com/docs
- Documentation Vercel : https://vercel.com/docs

