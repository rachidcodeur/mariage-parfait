# Configuration sur VPS Hostinger

## ✅ Vérifications pour le Sitemap

### 1. Emplacement du fichier `.env.local`

Le fichier `.env.local` doit être à la **racine du projet**, au même niveau que `package.json` :

```
/chemin/vers/votre/projet/
├── .env.local          ← ICI
├── package.json
├── next.config.js
├── app/
└── ...
```

### 2. Contenu du fichier `.env.local`

Assurez-vous que ces variables sont présentes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ltylxkpzujydcrccsyol.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Site URL
NEXT_PUBLIC_SITE_URL=https://mariage-parfait.net

# Autres variables...
```

### 3. Redémarrer le serveur Next.js

**IMPORTANT** : Après avoir modifié `.env.local`, vous devez **redémarrer** le serveur Next.js.

#### Si vous utilisez `npm start` directement :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm start
```

#### Si vous utilisez PM2 :

```bash
# Redémarrer l'application
pm2 restart mariage-parfait
# ou
pm2 restart all
```

#### Si vous utilisez systemd :

```bash
sudo systemctl restart nextjs
# ou le nom de votre service
```

### 4. Vérifier que les variables sont chargées

Créez une route de test temporaire pour vérifier :

```typescript
// app/api/test-env/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
  })
}
```

Accédez à `https://mariage-parfait.net/api/test-env` pour vérifier.

### 5. Vérifier les logs du serveur

Consultez les logs pour voir les messages du sitemap :

```bash
# Si vous utilisez PM2
pm2 logs mariage-parfait

# Si vous utilisez systemd
sudo journalctl -u nextjs -f

# Si vous utilisez npm start directement
# Les logs s'affichent dans le terminal
```

Recherchez les messages commençant par `[Sitemap]` :
- `[Sitemap] Starting sitemap generation...`
- `[Sitemap] Found X articles to include`
- `[Sitemap] Found X providers to include`

### 6. Rebuild si nécessaire

Si le problème persiste, essayez de rebuilder l'application :

```bash
# Arrêter le serveur
# Puis :
npm run build
npm start
```

## 🔍 Diagnostic

### Problème : Le sitemap ne contient que les pages statiques

**Causes possibles :**

1. **Le serveur n'a pas été redémarré** après modification de `.env.local`
   - **Solution** : Redémarrez le serveur

2. **Le fichier `.env.local` n'est pas au bon endroit**
   - **Solution** : Vérifiez qu'il est à la racine du projet

3. **Les variables ne sont pas chargées**
   - **Solution** : Utilisez la route `/api/test-env` pour vérifier

4. **Problème de permissions sur le fichier `.env.local`**
   - **Solution** : Vérifiez les permissions avec `ls -la .env.local`

5. **Le build de production n'inclut pas les variables**
   - **Solution** : Rebuild avec `npm run build`

## 📝 Checklist

- [ ] Le fichier `.env.local` est à la racine du projet
- [ ] Les variables `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont présentes
- [ ] Le serveur Next.js a été redémarré après modification
- [ ] Les logs montrent `[Sitemap] Found X articles` et `[Sitemap] Found X providers`
- [ ] Le sitemap contient les articles et prestataires

## 🚀 Commandes Utiles

```bash
# Vérifier que le fichier existe
ls -la .env.local

# Vérifier le contenu (sans afficher les valeurs sensibles)
grep -E "^[A-Z_]+=" .env.local | cut -d'=' -f1

# Redémarrer PM2
pm2 restart all

# Voir les logs en temps réel
pm2 logs

# Rebuild l'application
npm run build && npm start
```

