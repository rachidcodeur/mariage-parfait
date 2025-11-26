# Configuration AdSense en local

## 📋 Étapes pour activer AdSense en développement local

### 1. Créer le fichier `.env.local`

À la racine de votre projet (même niveau que `package.json`), créez un fichier nommé `.env.local`

**Important** : Le fichier doit commencer par un point (`.env.local`)

### 2. Ajouter votre Publisher ID

Dans le fichier `.env.local`, ajoutez :

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-VOTRE_ID_ICI
```

**Remplacez `ca-pub-VOTRE_ID_ICI` par votre vrai Publisher ID** (format : `ca-pub-XXXXXXXXXX`)

### 3. Vérifier les Ad Slot IDs dans le code

Vérifiez que vous avez remplacé tous les `1234567890` par vos vrais IDs :

- ✅ `app/page.tsx` ligne ~282 : Vous avez déjà `4063903167` ✓
- ⚠️ `app/blog/page.tsx` ligne ~306 : Vérifiez que ce n'est plus `1234567890`
- ⚠️ `app/blog/[slug]/page.tsx` ligne ~157 : Vérifiez que ce n'est plus `1234567890`

### 4. Redémarrer le serveur de développement

**CRUCIAL** : Après avoir créé/modifié `.env.local`, vous DEVEZ redémarrer le serveur :

```bash
# Arrêtez le serveur avec Ctrl+C
# Puis relancez :
npm run dev
```

### 5. Vérifier que ça fonctionne

1. Ouvrez votre navigateur sur `http://localhost:3000`
2. Ouvrez la console (F12)
3. Tapez : `process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID`
   - Si vous voyez `undefined` → Le fichier `.env.local` n'est pas lu
   - Si vous voyez votre ID → C'est bon !

4. Vérifiez dans la console s'il y a des erreurs AdSense

## 🔍 Vérifications rapides

### Vérifier que le fichier existe

Dans votre terminal, à la racine du projet :

```bash
ls -la .env.local
```

Si le fichier n'existe pas, créez-le :

```bash
touch .env.local
```

Puis éditez-le avec votre éditeur de texte.

### Vérifier le contenu du fichier

```bash
cat .env.local
```

Vous devriez voir :
```
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
```

### Vérifier que Next.js lit le fichier

Dans la console du navigateur (F12), tapez :

```javascript
console.log(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID)
```

Si vous voyez `undefined`, c'est que :
- Le fichier n'existe pas
- Le nom du fichier est incorrect (doit être `.env.local` avec le point)
- Le serveur n'a pas été redémarré

## ⚠️ Points importants

1. **Le fichier doit s'appeler `.env.local`** (avec le point au début)
2. **Pas d'espaces** autour du `=` dans le fichier
3. **Pas de guillemets** autour de la valeur
4. **Redémarrer le serveur** après chaque modification
5. **Le fichier `.env.local` ne doit PAS être commité** dans Git (il est normalement dans `.gitignore`)

## 🐛 Si ça ne fonctionne toujours pas

1. Vérifiez que vous voyez le message "Configurez AdSense dans .env.local" sur la page
   - Si OUI → Le fichier `.env.local` n'est pas lu ou contient le placeholder
   - Si NON → Le fichier est lu, mais il y a un autre problème

2. Vérifiez la console du navigateur pour des erreurs

3. Vérifiez que votre Publisher ID est correct dans AdSense

4. Vérifiez que vos Ad Slot IDs sont corrects

