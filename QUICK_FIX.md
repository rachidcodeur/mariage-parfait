# 🔧 Correction rapide pour AdSense en local

## Le problème

Votre fichier `.env.local` existe mais il **manque la variable AdSense**.

## ✅ Solution

1. **Ouvrez le fichier `.env.local`** à la racine de votre projet

2. **Ajoutez ces lignes à la fin du fichier** :

```env
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-VOTRE_ID_ICI
```

3. **Remplacez `ca-pub-VOTRE_ID_ICI`** par votre vrai Publisher ID AdSense (format : `ca-pub-XXXXXXXXXX`)

4. **Sauvegardez le fichier**

5. **REDÉMARREZ le serveur de développement** :
   ```bash
   # Arrêtez avec Ctrl+C
   # Puis relancez :
   npm run dev
   ```

## 📍 Où trouver votre Publisher ID ?

1. Allez sur [Google AdSense](https://www.google.com/adsense/)
2. Connectez-vous
3. Allez dans **Paramètres** > **Compte**
4. Copiez votre **Publisher ID** (commence par `ca-pub-`)

## ✅ Vérification

Après avoir redémarré, ouvrez la console du navigateur (F12) et tapez :

```javascript
process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
```

Vous devriez voir votre Publisher ID, pas `undefined`.

## ⚠️ Important

- Les Ad Slot IDs sont déjà configurés dans le code ✓
- Il ne manque que le Publisher ID dans `.env.local`
- **N'oubliez pas de redémarrer le serveur** après avoir modifié `.env.local`

