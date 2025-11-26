# Système de Revendication de Fiches

## Description

Le système de revendication permet aux utilisateurs de réclamer une fiche existante dans l'annuaire s'ils sont les propriétaires légitimes de l'entreprise référencée.

## Fonctionnalités

1. **Recherche de fiche existante** : Avant de créer une nouvelle fiche, l'utilisateur peut rechercher par :
   - Nom d'entreprise
   - Email
   - Numéro de téléphone (avec normalisation pour les numéros français)

2. **Normalisation des numéros de téléphone** : 
   - Gère les formats : `+33 7 59 17 50 29`, `+33 07 59 17 50 29`, `7 59 17 50 29`, `07 59 17 50 29`
   - Ignore les espaces, tirets, points, parenthèses
   - Convertit `+33` en `0`
   - Normalise tous les formats vers un format unique pour la comparaison

3. **Revendication** : Si une fiche est trouvée, l'utilisateur peut :
   - Remplir une justification expliquant pourquoi il revendique la fiche
   - Envoyer une demande de revendication qui sera examinée par un administrateur
   - Ou créer une nouvelle fiche s'il s'agit d'une entreprise différente

## Installation

### 1. Créer la table `provider_claims` dans Supabase

Exécutez le script SQL fourni dans `supabase/provider_claims.sql` dans l'éditeur SQL de Supabase :

1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Copiez-collez le contenu de `supabase/provider_claims.sql`
4. Exécutez le script

### 2. Structure de la table

La table `provider_claims` contient :
- `id` : Identifiant unique
- `provider_id` : ID de la fiche revendiquée
- `user_id` : ID de l'utilisateur qui revendique
- `justification` : Texte expliquant la revendication
- `status` : Statut (`pending`, `approved`, `rejected`)
- `admin_notes` : Notes de l'administrateur
- `reviewed_by` : ID de l'admin qui a examiné
- `reviewed_at` : Date d'examen
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

### 3. Permissions RLS

Les politiques RLS sont configurées pour que :
- Les utilisateurs ne puissent voir que leurs propres revendications
- Les utilisateurs puissent créer leurs propres revendications
- Les admins puissent voir toutes les revendications (à configurer selon votre système)

## Utilisation

### Pour les utilisateurs

1. Aller sur `/dashboard/fiches/nouvelle`
2. Rechercher une fiche existante par nom, email ou téléphone
3. Si une fiche est trouvée :
   - Remplir la justification
   - Cliquer sur "Récupérer la fiche"
   - Attendre la validation par un administrateur
4. Si aucune fiche n'est trouvée ou si l'utilisateur choisit "Créer une nouvelle fiche", le formulaire de création s'affiche

### Pour les administrateurs

Un système d'administration devra être créé pour :
- Voir toutes les revendications en attente
- Approuver ou rejeter les revendications
- Lors de l'approbation : transférer le `user_id` de la fiche vers l'utilisateur qui revendique

## Notes importantes

- La recherche de téléphone normalise tous les formats français pour une correspondance fiable
- Un utilisateur ne peut avoir qu'une seule revendication en attente par fiche (contrainte UNIQUE)
- Les revendications sont liées aux utilisateurs et aux fiches via des clés étrangères avec CASCADE

