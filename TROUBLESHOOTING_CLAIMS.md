# Dépannage - Erreur de Revendication

## Erreur : "Could not find the 'justification' column"

Cette erreur indique que la table `provider_claims` n'existe pas ou n'a pas été créée correctement dans Supabase.

## Solution rapide (RECOMMANDÉE)

**Option 1 : Script de vérification et correction automatique**

1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Copiez-collez le contenu du fichier `supabase/check_and_fix_provider_claims.sql`
4. Exécutez le script
5. Vérifiez les messages dans la console SQL - ils vous indiqueront ce qui a été créé/corrigé

**Option 2 : Recréer complètement la table**

Si l'option 1 ne fonctionne pas :

1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Copiez-collez le contenu du fichier `supabase/recreate_provider_claims.sql`
4. **ATTENTION** : Ce script supprimera toutes les données existantes dans `provider_claims`
5. Exécutez le script
6. Vérifiez que la table a été créée correctement

### Solution 1 : Vérifier que la table existe

1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Exécutez cette requête pour vérifier si la table existe :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'provider_claims';
```

Si aucun résultat n'est retourné, la table n'existe pas.

### Solution 2 : Créer la table

1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Copiez-collez le contenu complet du fichier `supabase/provider_claims.sql`
4. Exécutez le script

### Solution 3 : Vérifier la structure de la table

Si la table existe mais que l'erreur persiste, vérifiez que toutes les colonnes sont présentes :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'provider_claims' 
AND table_schema = 'public';
```

Vous devriez voir ces colonnes :
- `id`
- `provider_id`
- `user_id`
- `justification` ← **Cette colonne doit être présente**
- `status`
- `admin_notes`
- `reviewed_by`
- `reviewed_at`
- `created_at`
- `updated_at`

### Solution 4 : Recréer la table si nécessaire

Si la table existe mais qu'il manque des colonnes, vous pouvez la supprimer et la recréer :

```sql
-- ATTENTION : Cela supprimera toutes les données existantes
DROP TABLE IF EXISTS provider_claims CASCADE;

-- Puis exécutez le script complet de supabase/provider_claims.sql
```

### Solution 5 : Rafraîchir le cache Supabase

Parfois, Supabase met en cache le schéma. Pour forcer un rafraîchissement :

1. Allez dans votre projet Supabase
2. Ouvrez l'onglet "Database" → "Tables"
3. Cliquez sur "Refresh" ou actualisez la page
4. Vérifiez que la table `provider_claims` apparaît dans la liste

### Solution 6 : Vérifier les permissions RLS

Assurez-vous que les politiques RLS sont correctement configurées :

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'provider_claims';

-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'provider_claims';
```

### Vérification finale

Après avoir créé la table, testez avec cette requête :

```sql
INSERT INTO provider_claims (provider_id, user_id, justification, status)
VALUES (1, '00000000-0000-0000-0000-000000000000', 'Test', 'pending')
RETURNING *;
```

Si cette requête fonctionne, la table est correctement configurée.

## Script SQL complet

Le script complet se trouve dans `supabase/provider_claims.sql`. Assurez-vous de l'exécuter en entier dans l'éditeur SQL de Supabase.

