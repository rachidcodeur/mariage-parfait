# Correction du problème de formulaire de contact

## Problème identifié

L'erreur "Internal server error" indique que la table `mariage_parfait_contact_submissions` n'existe pas dans votre base de données Supabase.

## Solution

### Étape 1 : Accéder à Supabase SQL Editor

1. Connectez-vous à votre projet Supabase : https://app.supabase.com
2. Allez dans **SQL Editor** dans le menu de gauche
3. Cliquez sur **New query**

### Étape 2 : Exécuter le script SQL

Copiez et exécutez le contenu du fichier `supabase/check_and_create_contact_table.sql` dans l'éditeur SQL de Supabase.

Ce script va :
- ✅ Vérifier si la table existe
- ✅ Créer la table si elle n'existe pas
- ✅ Ajouter toutes les colonnes nécessaires (name, email, request_type, subject, message)
- ✅ Configurer RLS (Row Level Security) pour permettre l'insertion publique
- ✅ Créer les index pour améliorer les performances

### Étape 3 : Vérifier que tout fonctionne

1. Après avoir exécuté le script, testez à nouveau la route de debug :
   ```
   http://localhost:3000/api/contact/debug
   ```

2. Vous devriez voir :
   ```json
   {
     "tableExists": true,
     "insertTest": {
       "success": true
     }
   }
   ```

3. Testez ensuite le formulaire de contact sur votre site.

## Structure de la table créée

La table `mariage_parfait_contact_submissions` aura les colonnes suivantes :

- `id` (BIGSERIAL) - Identifiant unique
- `created_at` (TIMESTAMPTZ) - Date de création
- `name` (TEXT) - Nom complet
- `email` (TEXT) - Adresse email
- `request_type` (TEXT) - Type de demande
- `subject` (TEXT) - Sujet du message
- `message` (TEXT) - Message

## Si vous avez déjà une table avec un nom différent

Si votre table a un nom différent (par exemple `contact_submissions`), vous avez deux options :

1. **Renommer la table** :
   ```sql
   ALTER TABLE votre_nom_de_table RENAME TO mariage_parfait_contact_submissions;
   ```

2. **Modifier le code** pour utiliser le nom de votre table existante dans `app/api/contact/submit/route.ts`

## Vérification rapide

Pour vérifier que la table existe et a les bonnes colonnes, exécutez ce SQL dans Supabase :

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'mariage_parfait_contact_submissions'
ORDER BY ordinal_position;
```

Vous devriez voir 7 colonnes : id, created_at, name, email, request_type, subject, message.

