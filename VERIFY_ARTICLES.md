# Vérification des articles et catégories

## 🔍 Vérifier les articles dans Supabase

Pour vérifier que vos articles ont les bons `category_id`, vous pouvez :

### Option 1 : Via l'interface Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Table Editor** > **articles**
4. Vérifiez la colonne `category_id`
5. Les valeurs doivent être entre 1 et 12 selon le mapping suivant :

| ID | Catégorie | Slug |
|---|---|---|
| 1 | Robes de Mariée | robes-mariee |
| 2 | Beauté | beaute |
| 3 | Budget | budget |
| 4 | Cérémonie & Réception | ceremonie-reception |
| 5 | Décoration | decoration |
| 6 | Gastronomie | gastronomie |
| 7 | Inspiration | inspiration |
| 8 | Papeterie & Détails | papeterie-details |
| 9 | Photo & Vidéo | photo-video |
| 10 | Prestataires | prestataires |
| 11 | Tendances | tendances |
| 12 | Voyage de Noces | voyage-noces |

### Option 2 : Via l'API

Appelez cette route pour voir les statistiques :

```bash
curl http://localhost:3000/api/articles/fix-categories
```

Ou ouvrez dans votre navigateur :
```
http://localhost:3000/api/articles/fix-categories
```

## 🔧 Corriger les articles

Si certains articles ont des `category_id` incorrects :

1. **Manuellement dans Supabase** :
   - Ouvrez l'article dans Supabase
   - Modifiez le `category_id` selon le tableau ci-dessus
   - Sauvegardez

2. **Via SQL dans Supabase** :
   ```sql
   -- Voir tous les category_id utilisés
   SELECT DISTINCT category_id, COUNT(*) 
   FROM articles 
   GROUP BY category_id;
   
   -- Mettre à jour un article spécifique
   UPDATE articles 
   SET category_id = 2 
   WHERE id = 123; -- Remplacez 123 par l'ID de l'article
   ```

## ✅ Vérification finale

1. Cliquez sur une catégorie depuis la page d'accueil
2. Vous devriez être redirigé vers `/blog?category=beaute` (par exemple)
3. La page blog devrait afficher les articles de cette catégorie
4. La catégorie devrait être sélectionnée dans le slider

Si vous voyez "Aucun article trouvé", vérifiez que :
- Les articles dans Supabase ont bien un `category_id` valide (1-12)
- Le `category_id` correspond bien à la catégorie cliquée

