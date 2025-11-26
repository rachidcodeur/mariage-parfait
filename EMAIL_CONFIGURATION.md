# Configuration des Emails Supabase

## Problème : Pas d'email de confirmation reçu

Si vous ne recevez pas d'email de confirmation lors de l'inscription, voici les causes possibles et les solutions :

## Causes possibles

### 1. Configuration email non activée dans Supabase

Par défaut, Supabase utilise un service email limité. Il faut configurer un SMTP personnalisé pour la production.

### 2. Emails dans les spams

Vérifiez votre dossier spam/courrier indésirable.

### 3. Limites du service email par défaut

Le service email intégré de Supabase a des limites strictes et peut ne pas fonctionner en développement local.

## Solutions

### Solution 1 : Configurer un SMTP personnalisé (Recommandé pour la production)

1. Allez dans votre projet Supabase
2. Ouvrez **Settings** > **Auth** > **SMTP Settings**
3. Configurez votre SMTP :
   - **Host** : smtp.gmail.com (pour Gmail) ou votre serveur SMTP
   - **Port** : 587 (TLS) ou 465 (SSL)
   - **Username** : Votre adresse email
   - **Password** : Mot de passe d'application (pour Gmail) ou mot de passe SMTP
   - **Sender email** : L'adresse email qui enverra les emails
   - **Sender name** : Nom de l'expéditeur

**Pour Gmail :**
- Activez l'authentification à 2 facteurs
- Créez un "Mot de passe d'application" dans les paramètres Google
- Utilisez ce mot de passe dans la configuration SMTP

### Solution 2 : Désactiver la confirmation email en développement

Pour le développement local, vous pouvez désactiver la confirmation email :

1. Allez dans **Settings** > **Auth** > **Email Auth**
2. Désactivez **"Enable email confirmations"** (temporairement pour le développement)

⚠️ **Attention** : Réactivez cette option en production pour la sécurité.

### Solution 3 : Vérifier les logs Supabase

1. Allez dans **Logs** > **Auth Logs**
2. Vérifiez s'il y a des erreurs lors de l'envoi d'emails
3. Les logs indiqueront si l'email a été envoyé ou s'il y a eu une erreur

### Solution 4 : Utiliser un service de test d'emails

Pour le développement, vous pouvez utiliser :
- **Mailtrap** : Service de test d'emails qui capture les emails sans les envoyer
- **MailHog** : Alternative open-source

## Configuration recommandée pour la production

1. **Utiliser un service SMTP fiable** :
   - Gmail (avec mot de passe d'application)
   - SendGrid
   - Mailgun
   - Amazon SES
   - OVH / O2Switch (pour les emails français)

2. **Configurer les templates d'emails** :
   - Personnaliser les emails de confirmation
   - Ajouter votre logo et branding
   - Configurer les emails de réinitialisation de mot de passe

3. **Vérifier les paramètres d'authentification** :
   - **Settings** > **Auth** > **Email Auth**
   - Activer "Enable email confirmations"
   - Configurer l'URL de redirection après confirmation

## Vérification rapide

Pour vérifier si les emails fonctionnent :

1. Allez dans **Settings** > **Auth** > **Email Templates**
2. Testez l'envoi d'un email de test
3. Vérifiez les logs pour voir si l'email a été envoyé

## En cas de problème persistant

1. Vérifiez que votre domaine n'est pas blacklisté
2. Contactez le support Supabase
3. Consultez la documentation : https://supabase.com/docs/guides/auth/auth-email

