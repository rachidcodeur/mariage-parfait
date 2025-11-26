# Diagnostic : Articles non trouvés par catégorie

## 🔍 Étapes de diagnostic

### 1. Vérifier les logs dans la console

1. Ouvrez la console du navigateur (F12)
2. Cliquez sur une catégorie depuis la page d'accueil
3. Regardez les logs qui commencent par `[BlogPage]` et `[getArticles]`

Vous devriez voir :
- `[BlogPage] Fetching articles: { selectedCategory: "beaute", url: "..." }`
- `[getArticles] Filtering by category: "beaute" -> ID: 2`
- `[getArticles] Found X articles for category: beaute`

### 2. Vérifier via l'API de debug

Ouvrez dans votre navigateur :
```
http://localhost:3000/api/articles/debug
```

Cela vous montrera :
- Le nombre total d'articles
- Le nombre d'articles par catégorie
- Le mapping des catégories
- Des exemples d'articles

### 3. Vérifier directement dans Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Exécutez cette requête :

```sql
-- Voir tous les articles avec leurs catégories
SELECT 
  id, 
  title, 
  category_id,
  created_at
FROM articles
ORDER BY created_at DESC
LIMIT 20;
```

5. Vérifiez que les `category_id` sont entre 1 et 12

### 4. Vérifier le mapping des catégories

Les catégories doivent correspondre à ce mapping :

| Slug | ID | Nom |
|---|---|---|
| robes-mariee | 1 | Robes de Mariée |
| beaute | 2 | Beauté |
| budget | 3 | Budget |
| ceremonie-reception | 4 | Cérémonie & Réception |
| decoration | 5 | Décoration |
| gastronomie | 6 | Gastronomie |
| inspiration | 7 | Inspiration |
| papeterie-details | 8 | Papeterie & Détails |
| photo-video | 9 | Photo & Vidéo |
| prestataires | 10 | Prestataires |
| tendances | 11 | Tendances |
| voyage-noces | 12 | Voyage de Noces |

## 🔧 Solutions

### Si vous n'avez pas d'articles du tout

Générez des articles manuellement :

```bash
# Appelez cette route pour générer un article
curl -X POST http://localhost:3000/api/articles/generate
```

Ou créez-les directement dans Supabase.

### Si les articles ont de mauvais category_id

Corrigez-les dans Supabase :

```sql
-- Exemple : mettre tous les articles sans catégorie valide en "Inspiration" (ID 7)
UPDATE articles 
SET category_id = 7 
WHERE category_id NOT BETWEEN 1 AND 12;

-- Ou corriger un article spécifique
UPDATE articles 
SET category_id = 2 
WHERE id = 123; -- Remplacez 123 par l'ID de l'article
```

### Si le mapping ne correspond pas

Vérifiez que les IDs dans `lib/categories.ts` correspondent bien à ceux dans votre base de données.

## 📊 Requête SQL utile

Pour voir la répartition des articles par catégorie :

```sql
SELECT 
  category_id,
  COUNT(*) as count
FROM articles
GROUP BY category_id
ORDER BY category_id;
```

Pour voir les articles d'une catégorie spécifique :

```sql
-- Articles de la catégorie "Beauté" (ID 2)
SELECT id, title, category_id, created_at
FROM articles
WHERE category_id = 2
ORDER BY created_at DESC;
```

