# Tests - Prospection CRM

## 📊 Résumé

Infrastructure de tests complète avec **Jest** et **React Testing Library**.

```bash
✅ 20 tests passés
✅ 3 suites de tests
✅ Coverage: Hooks + Composants
```

## 🚀 Commandes

```bash
# Exécuter tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Génération du coverage
npm run test:coverage
```

## 📁 Structure des Tests

```
__tests__/
├── hooks/
│   └── useProspects.test.ts      # Tests du hook de gestion des prospects
└── components/
    ├── ProspectCard.test.tsx     # Tests de la carte prospect
    └── KanbanBoard.test.tsx      # Tests du tableau Kanban
```

## 🧪 Tests Implémentés

### useProspects Hook (6 tests)
- ✅ Charge les prospects au montage
- ✅ Ajoute un nouveau prospect
- ✅ Met à jour un prospect existant
- ✅ Supprime un prospect
- ✅ Gère les erreurs de chargement
- ✅ État de chargement correct

### ProspectCard Component (8 tests)
- ✅ Affiche les informations du prospect
- ✅ Affiche le statut correct
- ✅ Gère l'absence de valeur estimée
- ✅ Appelle onDelete au clic
- ✅ Affiche un dropdown de statut (mode édition)
- ✅ Affiche un badge statique (mode lecture)
- ✅ Appelle onStatusChange lors du changement
- ✅ Affiche le lien vers les détails

### KanbanBoard Component (6 tests)
- ✅ Affiche toutes les colonnes de statut (7)
- ✅ Affiche les prospects dans les bonnes colonnes
- ✅ Affiche le compteur par colonne
- ✅ Affiche un message pour colonnes vides
- ✅ Les cartes sont draggables
- ✅ Appelle onDelete au clic

## 🔧 Configuration

### jest.config.js
- Environnement jsdom (tests browser)
- Support TypeScript
- Mapping des paths (@/...)
- Coverage configuré

### jest.setup.js
- Mocks Next.js (router, navigation)
- Mocks NextAuth (session)
- Mocks Supabase (client DB)
- Configuration @testing-library/jest-dom

## 📈 Prochaines Étapes

### Tests à Ajouter
1. **Tests d'Intégration**
   - Flow complet création → édition → suppression
   - Drag & drop dans Kanban
   - Synchronisation Supabase

2. **Tests E2E** (Playwright/Cypress)
   - Parcours utilisateur complet
   - Intégration Google Calendar
   - Authentification NextAuth

3. **Tests de Performance**
   - Rendering avec 1000+ prospects
   - Optimisation des re-renders

4. **Tests API**
   - Routes NextAuth
   - API Google Calendar
   - Validation des données

### Amélioration du Coverage

```bash
# Objectif: 80%+ coverage
npm run test:coverage

# Zones à couvrir:
- lib/supabaseClient.ts
- app/page.tsx (intégration)
- app/prospects/[id]/page.tsx
- GoogleCalendarButton.tsx
```

## 🛠️ Outils Utilisés

| Outil | Version | Usage |
|-------|---------|-------|
| Jest | Latest | Test runner |
| @testing-library/react | ^16.3.2 | Tests React |
| @testing-library/jest-dom | ^6.9.1 | Matchers DOM |
| @testing-library/user-event | ^14.6.1 | Interactions utilisateur |
| @types/jest | ^30.0.0 | Types TypeScript |

## 📝 Bonnes Pratiques

### Écriture de Tests
```typescript
// ✅ BON: Test spécifique et isolé
it('appelle onDelete avec le bon ID', async () => {
  const mockDelete = jest.fn()
  render(<ProspectCard prospect={mockData} onDelete={mockDelete} />)
  
  await user.click(screen.getByText('Supprimer'))
  
  expect(mockDelete).toHaveBeenCalledWith('123')
})

// ❌ MAUVAIS: Test trop large
it('fonctionne correctement', () => {
  // teste trop de choses à la fois
})
```

### Mocking
```typescript
// Toujours nettoyer les mocks
beforeEach(() => {
  jest.clearAllMocks()
})

// Utiliser des données réalistes
const mockProspect: Prospect = {
  id: '1',
  nom: 'John Doe',
  // ... données complètes
}
```

### Async/Await
```typescript
// Wrapper les mises à jour d'état dans act()
await act(async () => {
  await result.current.addProspect(newProspect)
})

// Utiliser waitFor pour les chargements
await waitFor(() => {
  expect(result.current.isLoading).toBe(false)
})
```

## 🐛 Debugging

```bash
# Tests en mode verbose
npm test -- --verbose

# Un seul fichier
npm test -- ProspectCard

# Watch un fichier spécifique
npm test -- --watch ProspectCard

# Afficher le coverage détaillé
npm run test:coverage -- --verbose
```

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
