# Guide de débogage AdSense

Si les encarts publicitaires ne s'affichent pas, suivez ces étapes de vérification :

## ✅ Vérifications à faire

### 1. Vérifier les variables d'environnement

**En développement local :**
- Vérifiez que le fichier `.env.local` existe à la racine du projet
- Vérifiez que `NEXT_PUBLIC_ADSENSE_CLIENT_ID` contient votre vrai Publisher ID (format: `ca-pub-XXXXXXXXXX`)
- **Important** : Redémarrez le serveur de développement après avoir modifié `.env.local`
  ```bash
  # Arrêtez le serveur (Ctrl+C) puis relancez
  npm run dev
  ```

**En production (Vercel, etc.) :**
- Allez dans les paramètres de votre projet
- Vérifiez que la variable `NEXT_PUBLIC_ADSENSE_CLIENT_ID` est bien définie
- Redéployez votre site après avoir ajouté/modifié la variable

### 2. Vérifier les Ad Slot IDs

Vérifiez que vous avez remplacé tous les placeholders `1234567890` par vos vrais IDs d'unités publicitaires :

- `app/page.tsx` ligne ~282
- `app/blog/page.tsx` ligne ~306  
- `app/blog/[slug]/page.tsx` ligne ~157

### 3. Vérifier dans la console du navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Recherchez des erreurs liées à AdSense
4. Vérifiez que le script AdSense se charge :
   - Dans l'onglet **Network**, recherchez `adsbygoogle.js`
   - Vérifiez qu'il se charge avec un statut 200

### 4. Vérifier que votre site est approuvé par AdSense

- Connectez-vous à [Google AdSense](https://www.google.com/adsense/)
- Vérifiez que votre site est **approuvé** et **actif**
- Si votre site est en attente d'approbation, les annonces ne s'afficheront pas

### 5. Vérifier le code source de la page

1. Faites un clic droit sur la page > **Afficher le code source**
2. Recherchez `adsbygoogle`
3. Vérifiez que :
   - Le script est présent : `<script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..."`
   - Les éléments `<ins class="adsbygoogle">` sont présents avec les bons attributs `data-ad-client` et `data-ad-slot`

### 6. Tester avec des valeurs de test

Si vous voyez le message "Configurez AdSense dans .env.local", cela signifie que :
- Soit `NEXT_PUBLIC_ADSENSE_CLIENT_ID` n'est pas défini
- Soit il contient encore la valeur placeholder `ca-pub-XXXXXXXXXX`
- Soit les Ad Slot IDs sont encore `1234567890`

## 🔧 Solutions courantes

### Problème : Les variables d'environnement ne sont pas chargées

**Solution :**
1. Vérifiez que le fichier s'appelle bien `.env.local` (avec le point au début)
2. Vérifiez qu'il est à la racine du projet (même niveau que `package.json`)
3. Redémarrez le serveur de développement
4. En production, vérifiez dans les paramètres de votre hébergeur

### Problème : Le script AdSense ne se charge pas

**Solution :**
1. Vérifiez votre connexion internet
2. Vérifiez qu'il n'y a pas de bloqueur de publicités actif
3. Vérifiez la console pour des erreurs CORS ou de chargement

### Problème : Les annonces ne s'affichent pas mais le script se charge

**Causes possibles :**
1. Votre site n'est pas encore approuvé par AdSense
2. Les Ad Slot IDs sont incorrects
3. Votre compte AdSense n'est pas actif
4. Il n'y a pas d'annonces disponibles pour votre région/contenu

**Solution :**
- Attendez l'approbation de Google (peut prendre plusieurs jours)
- Vérifiez que vos Ad Slot IDs sont corrects dans AdSense
- Vérifiez que votre compte AdSense est actif

## 🧪 Test rapide

Pour vérifier rapidement si AdSense est configuré :

1. Ouvrez la console du navigateur (F12)
2. Tapez : `window.adsbygoogle`
3. Si vous voyez un tableau/array, le script est chargé
4. Si vous voyez `undefined`, le script n'est pas chargé

## 📞 Si le problème persiste

1. Vérifiez les logs de la console pour des erreurs spécifiques
2. Vérifiez que votre Publisher ID et Ad Slot IDs sont corrects
3. Vérifiez que votre site est approuvé dans AdSense
4. Contactez le support AdSense si nécessaire

