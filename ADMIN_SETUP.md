# Configuration du Super Admin

## Instructions pour créer le super admin

### Étape 1 : Inscription de l'utilisateur

1. Allez sur `/espace-pro`
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire avec :
   - **Email** : `rachdevcodeur@gmail.com`
   - **Mot de passe** : `Mafam3.0dev`
   - **Prénom** : (au choix)
   - **Nom** : (au choix)
   - **Téléphone** : (au choix)
4. Cliquez sur "S'inscrire"
5. Vérifiez votre email et confirmez votre compte

### Étape 2 : Marquer l'utilisateur comme super admin

1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Exécutez le script `supabase/setup_admin.sql`

Ce script va :
- Créer la table `admins` si elle n'existe pas
- Créer la fonction `is_admin()` pour vérifier les droits admin
- Créer la fonction `get_user_role()` pour obtenir le rôle d'un utilisateur
- Mettre à jour les métadonnées de l'utilisateur `rachdevcodeur@gmail.com` pour le marquer comme admin
- Insérer l'utilisateur dans la table `admins` avec le rôle `super_admin`

### Étape 3 : Vérification

Pour vérifier que l'utilisateur est bien admin, vous pouvez :

1. Vous connecter avec `rachdevcodeur@gmail.com`
2. Utiliser la fonction `isAdmin()` ou `isSuperAdmin()` dans votre code
3. Vérifier dans Supabase que l'utilisateur a bien `is_admin: true` dans ses métadonnées

## Utilisation dans le code

```typescript
import { isAdmin, isSuperAdmin, getUserRole } from '@/lib/admin-utils'
import { useAuth } from '@/components/AuthProvider'

function MyComponent() {
  const { user } = useAuth()
  
  // Vérifier si l'utilisateur est admin
  const checkAdmin = async () => {
    const admin = await isAdmin(user)
    const superAdmin = await isSuperAdmin(user)
    const role = await getUserRole(user)
    
    console.log('Is admin:', admin)
    console.log('Is super admin:', superAdmin)
    console.log('Role:', role)
  }
}
```

## Notes importantes

- Le script SQL doit être exécuté **après** que l'utilisateur se soit inscrit
- Si l'utilisateur n'existe pas encore, le script ne fera rien (mais ne générera pas d'erreur)
- Vous pouvez exécuter le script plusieurs fois sans problème (il utilise `ON CONFLICT`)
- Les fonctions `is_admin()` et `get_user_role()` sont disponibles dans Supabase pour les requêtes SQL

## Sécurité

- Les fonctions SQL utilisent `SECURITY DEFINER` pour avoir les droits nécessaires
- Les politiques RLS sont configurées pour que seuls les admins puissent voir certaines données
- Les métadonnées utilisateur sont protégées par Supabase Auth

