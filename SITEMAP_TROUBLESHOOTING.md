# Dépannage du Sitemap

## Problème : Le sitemap ne contient que les pages statiques

Si votre sitemap (`/sitemap.xml`) ne contient que les pages statiques (accueil, blog, annuaire, etc.) mais pas les articles ni les prestataires, cela signifie que les requêtes Supabase échouent.

## ✅ Solutions

### 1. Vérifier les variables d'environnement en production

Les variables d'environnement suivantes **DOIVENT** être configurées dans votre plateforme de déploiement (Vercel, Netlify, etc.) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

**Important :**
- `NEXT_PUBLIC_SUPABASE_URL` doit commencer par `https://`
- `SUPABASE_SERVICE_ROLE_KEY` est la clé **service_role** (pas la clé anon)
- Ces variables doivent être définies pour l'environnement **Production**

### 2. Comment vérifier les variables d'environnement

#### Sur Vercel :
1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Vérifiez que les variables sont définies pour **Production**
4. Si elles n'existent que pour Development/Preview, ajoutez-les pour Production

#### Sur Netlify :
1. Allez dans Site settings → Environment variables
2. Vérifiez que les variables sont définies
3. Assurez-vous qu'elles sont disponibles pour "Production"

### 3. Redéployer après modification des variables

**Important :** Après avoir ajouté ou modifié des variables d'environnement, vous devez **redéployer** votre application pour que les changements prennent effet.

### 4. Vérifier les logs

Consultez les logs de votre application en production pour voir les messages du sitemap :
- Recherchez les messages commençant par `[Sitemap]`
- Vérifiez s'il y a des erreurs Supabase
- Vérifiez si les variables sont détectées : `SUPABASE_URL: SET` ou `MISSING`

### 5. Tester la connexion Supabase

Vous pouvez tester si Supabase fonctionne en créant une route de test temporaire :

```typescript
// app/api/test-supabase/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      error: 'Variables manquantes',
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      serviceKey: supabaseServiceKey ? 'SET' : 'MISSING',
    }, { status: 500 })
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .limit(1)
  
  return NextResponse.json({
    success: !error,
    error: error?.message,
    dataCount: data?.length || 0,
  })
}
```

Accédez à `/api/test-supabase` pour vérifier si Supabase fonctionne.

## 📊 Statistiques attendues

Une fois que le sitemap fonctionne correctement, vous devriez voir :
- ✅ 5 pages statiques
- ✅ ~646 articles de blog
- ✅ ~3995 prestataires
- ✅ 12 catégories
- ✅ 12 régions
- ✅ 94 départements
- ✅ **Total : ~4764 pages**

## 🔍 Vérification rapide

1. Accédez à `https://votre-domaine.com/sitemap.xml`
2. Faites une recherche dans le fichier pour "blog/" (articles)
3. Faites une recherche pour "annuaire/prestataire/" (prestataires)
4. Si ces URLs n'apparaissent pas, les variables d'environnement ne sont probablement pas configurées

## ⚠️ Note importante

Le sitemap peut prendre quelques secondes à se générer car il contient plus de 4000 pages. Si le sitemap se charge mais ne contient que les pages statiques, c'est un problème de configuration des variables d'environnement.

