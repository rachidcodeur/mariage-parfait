# Design System Dashboard - Guide d'utilisation

Ce document décrit comment utiliser le design system pour toutes les pages dashboard.

## 🎨 Couleurs

Utilisez les classes Tailwind avec le préfixe `dashboard-` :

```tsx
// Couleurs principales
bg-dashboard-primary        // #ca3b76 - Boutons, accents
bg-dashboard-bg-main        // #FFFFFF - Background général
bg-dashboard-bg-secondary   // #F8F9FB - Background cards/blocs
border-dashboard-border     // #E6E6E6 - Bordures

// Couleurs texte
text-dashboard-text-main        // #2C2C2C - Texte principal
text-dashboard-text-secondary   // #555555 - Texte secondaire
text-dashboard-text-light       // #8A8A8A - Placeholder, sous-titres

// Couleurs statut
text-dashboard-success  // #16A34A - Stats en hausse
text-dashboard-alert    // #DC2626 - Stats en baisse
text-dashboard-info     // #2563EB - Statistiques neutres
bg-dashboard-hover      // #F1F1F1 - Hover states
```

## ✍️ Typographie

### Classes CSS disponibles

```tsx
// Titres
<h1 className="dashboard-h1">Titre principal (24px, Zalando Sans, 600)</h1>
<h2 className="dashboard-h2">Titre section (18px, Zalando Sans, 600)</h2>
<h3 className="dashboard-h3">Label secondaire (14px, Poppins, 500)</h3>

// Texte
<p className="dashboard-text">Texte normal (14px, Poppins, 400)</p>
<span className="dashboard-text-secondary">Texte secondaire (12px, Poppins, 400)</span>
```

### Hiérarchie recommandée

- **H1** : Pages principales, titres de dashboard
- **H2** : Sections comme "Sales Overview", "Vos fiches"
- **H3** : Labels, sous-titres de cartes
- **Texte normal** : Paragraphes, données, contenu
- **Texte secondaire** : Légendes, tooltips, placeholders

## 🔘 Boutons

### Bouton principal

```tsx
<button className="dashboard-btn-primary">
  Créer une fiche
</button>

// Avec icône
<Link href="/dashboard/fiches/nouvelle" className="dashboard-btn-primary flex items-center space-x-2">
  <HiPlus className="text-xl" />
  <span>Créer une fiche</span>
</Link>
```

**Spécifications :**
- Font : Poppins 14px, 600
- Background : #ca3b76
- Padding : 12px 20px
- Border-radius : 8px
- Hover : #b33469
- Shadow : 0px 2px 6px rgba(0,0,0,0.08)

### Bouton secondaire

```tsx
<button className="dashboard-btn-secondary">
  Annuler
</button>
```

**Spécifications :**
- Font : Poppins 14px, 600
- Background : #FFFFFF
- Bordure : 1px solid #E6E6E6
- Hover : #F1F1F1

## 📊 Cartes & Widgets

### Carte standard

```tsx
<div className="dashboard-card border border-dashboard-border">
  <h3 className="dashboard-card-title">Titre de la carte</h3>
  <p className="dashboard-card-value">Valeur principale</p>
</div>
```

**Spécifications :**
- Background : #FFFFFF
- Border-radius : 12px
- Padding : 20px
- Shadow : 0px 2px 10px rgba(0,0,0,0.06)

### Carte de statistique

```tsx
<div className="dashboard-card border border-dashboard-border">
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 bg-dashboard-info/10 rounded-lg flex items-center justify-center">
      <HiEye className="text-dashboard-info text-2xl" />
    </div>
  </div>
  <h3 className="dashboard-card-value mb-1">1,234</h3>
  <p className="dashboard-text-secondary">Vues totales</p>
</div>
```

## 📐 Layout & Espacement

### Sidebar

```tsx
<aside className="dashboard-sidebar shadow-lg fixed h-full border-r border-dashboard-border">
  {/* Contenu sidebar */}
</aside>
```

**Spécifications :**
- Largeur : 240px (fixe)
- Background : #FFFFFF
- Bordure droite : #E6E6E6

### Contenu principal

```tsx
<main className="flex-1 ml-[240px]">
  <div className="dashboard-content">
    {/* Contenu avec margin 24px */}
  </div>
</main>
```

**Spécifications :**
- Margin interne : 24px
- Espacement entre cartes : 16px (utiliser `dashboard-spacing`)

### Grille avec espacement

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 dashboard-spacing">
  {/* Cartes avec gap de 16px */}
</div>
```

## 🧩 Icônes

Utilisez Heroicons (Hi) avec ces spécifications :

```tsx
// Taille standard : 20px (text-xl)
<HiEye className="text-xl text-dashboard-text-secondary" />

// Couleurs
text-dashboard-text-secondary  // Par défaut (#555555)
text-dashboard-primary         // Actif (#ca3b76)
text-dashboard-text-light      // Désactivé (#8A8A8A)
```

## 📝 Inputs & Formulaires

```tsx
<input
  type="text"
  className="dashboard-input"
  placeholder="Rechercher..."
/>
```

**Spécifications :**
- Font : Poppins 14px, 400
- Background : #FFFFFF
- Bordure : 1px solid #E6E6E6
- Border-radius : 6px
- Padding : 10px 14px
- Placeholder : #8A8A8A
- Focus : bordure 2px solid #ca3b76

## 🎯 Exemple complet : Page Dashboard

```tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-dashboard-bg-secondary flex">
      {/* Sidebar */}
      <aside className="dashboard-sidebar shadow-lg fixed h-full border-r border-dashboard-border">
        {/* Navigation */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[240px]">
        <div className="dashboard-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="dashboard-h1 mb-2">Bonjour, Nom!</h1>
              <p className="dashboard-text text-dashboard-text-secondary">
                Voici un aperçu de votre activité.
              </p>
            </div>
            <Link href="/dashboard/fiches/nouvelle" className="dashboard-btn-primary">
              Créer une fiche
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 dashboard-spacing mb-8">
            <div className="dashboard-card border border-dashboard-border">
              <h3 className="dashboard-card-value">123</h3>
              <p className="dashboard-text-secondary">Fiches créées</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

## ✅ Checklist pour nouvelles pages

- [ ] Utiliser `dashboard-sidebar` pour la sidebar (240px)
- [ ] Utiliser `dashboard-content` pour le contenu principal (margin 24px)
- [ ] Utiliser `dashboard-h1` pour le titre principal
- [ ] Utiliser `dashboard-btn-primary` pour les boutons principaux
- [ ] Utiliser `dashboard-card` pour les cartes
- [ ] Utiliser `dashboard-spacing` pour l'espacement entre éléments (16px)
- [ ] Utiliser les couleurs `dashboard-*` au lieu de `primary-*`
- [ ] Vérifier que les polices sont correctes (Zalando Sans pour titres, Poppins pour texte)

## 🔄 Migration depuis l'ancien système

| Ancien | Nouveau |
|--------|---------|
| `bg-primary-500` | `bg-dashboard-primary` |
| `text-gray-800` | `text-dashboard-text-main` |
| `text-gray-600` | `text-dashboard-text-secondary` |
| `bg-white` | `bg-dashboard-bg-main` |
| `bg-gray-50` | `bg-dashboard-bg-secondary` |
| `border-gray-200` | `border-dashboard-border` |
| `w-64` (sidebar) | `dashboard-sidebar` (240px) |
| `p-8` (contenu) | `dashboard-content` (24px) |

