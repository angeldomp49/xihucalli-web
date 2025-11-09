# Système de Liaison de Comptes

## Vue d'Ensemble

Le Système de Liaison de Comptes permet aux utilisateurs de lier leur fournisseur d'authentification externe (Google, AWS Cognito, etc.) à un compte utilisateur interne existant lorsqu'une correspondance partielle est détectée pendant le processus d'authentification.

## Architecture

### Composants

1. **LinkAccountPageComponent**: Composant UI principal pour les décisions de liaison de comptes
2. **RegisterUserService**: Service pour la communication API avec les points de terminaison d'inscription
3. **SessionManagementService**: Gère la session utilisateur après une liaison réussie
4. **AuthCallbackPageComponent**: Redirige les utilisateurs vers la page de liaison lorsqu'une correspondance partielle est détectée

## Flux Utilisateur

### Scénario: Correspondance Partielle Détectée

Lorsqu'un utilisateur s'authentifie avec un fournisseur externe et que le backend détecte une correspondance partielle (ex. email ou nom correspondant), le flux suivant se produit:

```
Authentification Externe Réussie
        ↓
Callback du Backend
        ↓
Correspondance Partielle Détectée
        ↓
AuthCallbackPageComponent
        ↓
Navigation vers /link-account
        ↓
LinkAccountPageComponent
```

### Points de Décision de l'Utilisateur

#### Option 1: Accepter la Liaison (Lier au Compte Existant)

**Flux:**
1. L'utilisateur voit les informations du compte correspondant
2. L'utilisateur clique sur "Oui, lier à ce compte"
3. Le système appelle le backend avec `client_choice=ACCEPT`
4. Le backend lie la connexion externe à l'utilisateur maître existant
5. Le système reçoit le jeton JWT
6. L'utilisateur est connecté et redirigé vers la page d'accueil

**Appel API:**
```typescript
registerService.acceptLinkAccount(operationId)
  .subscribe({
    next: (response) => {
      sessionManagement.login(response.token);
      router.navigate(['/keyring']);
    }
  });
```

#### Option 2: Rejeter la Liaison (Créer un Nouveau Compte)

**Flux:**
1. L'utilisateur voit les informations du compte correspondant
2. L'utilisateur clique sur "Non, créer un nouveau compte"
3. Le formulaire d'inscription apparaît
4. L'utilisateur remplit le nom d'affichage et le nom d'utilisateur
5. Le système appelle le backend avec `client_choice=REJECT` et les données de profil
6. Le backend crée un nouveau utilisateur maître et lie la connexion externe
7. Le système reçoit le jeton JWT
8. L'utilisateur est connecté et redirigé vers la page d'accueil

**Appel API:**
```typescript
registerService.rejectLinkAccount(operationId, displayName, username)
  .subscribe({
    next: (response) => {
      sessionManagement.login(response.token);
      router.navigate(['/keyring']);
    }
  });
```

## Détails du Composant

### LinkAccountPageComponent

**Emplacement:** `src/app/pages/link-account-page/`

**Responsabilités:**
- Afficher les informations du compte correspondant du backend
- Présenter des options claires d'accepter/rejeter à l'utilisateur
- Afficher le formulaire d'inscription lors du rejet
- Valider la saisie utilisateur pour la création d'un nouveau compte
- Gérer les appels et réponses API
- Gérer les états de chargement et d'erreur

**Propriétés Clés:**
- `matchingDisplayName`: Nom d'affichage du compte potentiellement correspondant
- `operationId`: UUID de l'opération d'inscription
- `showRegistrationForm`: Booléen pour basculer entre les vues de décision et d'inscription
- `loading`: État de chargement pendant les appels API
- `errorMessage`: Affichage du message d'erreur

**Méthodes Clés:**
- `onAcceptLink()`: Gérer l'acceptation de liaison par l'utilisateur
- `onRejectLink()`: Gérer le rejet de liaison par l'utilisateur
- `onSubmitNewAccount()`: Gérer la soumission du formulaire de nouveau compte
- `loadParameters()`: Extraire les paramètres de requête de l'URL

### Paramètres URL

Le composant attend les paramètres de requête suivants:

- `operation_id` (requis): UUID du callback d'authentification
- `operation_type` (optionnel): Type d'opération (pour contexte)
- `matching_display_name` (requis): Nom d'affichage du compte correspondant

**Exemple URL:**
```
/link-account?operation_id=550e8400-e29b-41d4-a716-446655440000&matching_display_name=John%20Doe
```

## Caractéristiques UI/UX

### Design Visuel

- Mise en page propre et moderne basée sur des cartes
- Arrière-plan dégradé violet pour la cohérence
- Icône d'avatar utilisateur pour l'affichage du compte correspondant
- Typographie claire et lisible
- Design réactif pour mobile et ordinateur

### Expérience Utilisateur

1. **Affichage Clair des Informations:**
   - Affiche le nom du compte correspondant de manière proéminente
   - Utilise une carte visuelle pour mettre en évidence la correspondance
   - Question claire: "Est-ce votre compte?"

2. **Boutons d'Action Évidents:**
   - Bouton primaire (dégradé violet): "Oui, lier à ce compte"
   - Bouton secondaire (gris): "Non, créer un nouveau compte"
   - Boutons grands et adaptés au tactile

3. **Divulgation Progressive:**
   - Le formulaire d'inscription n'apparaît qu'après le rejet
   - Réduit la charge cognitive
   - Flux clair d'aller-retour

4. **Retour d'Information et Validation:**
   - Validation du formulaire en temps réel
   - Messages d'erreur clairs
   - Spinner de chargement pendant les appels API
   - Redirection automatique en cas de succès

## Validation du Formulaire

Lors de la création d'un nouveau compte après rejet, les règles de validation suivantes s'appliquent:

### Nom d'Affichage
- **Requis:** Oui
- **Longueur Minimale:** 2 caractères
- **Message d'Erreur:** "Le nom d'affichage est requis" / "Le nom d'affichage doit contenir au moins 2 caractères"

### Nom d'Utilisateur
- **Requis:** Oui
- **Longueur Minimale:** 3 caractères
- **Modèle:** Seulement caractères alphanumériques, traits d'union et underscores
- **Regex:** `/^[a-zA-Z0-9_-]+$/`
- **Messages d'Erreur:**
  - "Le nom d'utilisateur est requis"
  - "Le nom d'utilisateur doit contenir au moins 3 caractères"
  - "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, traits d'union et underscores"

## Gestion des Erreurs

### Erreurs Côté Client

1. **ID d'Opération Manquant:**
   - Message: "Requête invalide. ID d'opération manquant."
   - Action: Afficher l'erreur, empêcher les actions

2. **Erreurs de Validation du Formulaire:**
   - Message: Messages d'erreur spécifiques au champ
   - Action: Mettre en évidence les champs invalides, afficher le texte d'erreur

### Erreurs Côté Serveur

1. **Inscription Échouée:**
   - Message: Message d'erreur du backend ou "L'opération a échoué. Veuillez réessayer."
   - Action: Afficher l'erreur, permettre une nouvelle tentative

2. **Erreurs Réseau:**
   - Message: "L'opération a échoué. Veuillez réessayer."
   - Action: Afficher l'erreur, permettre une nouvelle tentative

## Considérations de Sécurité

### Protection de l'ID d'Opération

- Les IDs d'opération sont des UUIDs pour prévenir l'énumération
- Chaque opération ne peut être traitée qu'une seule fois
- Les opérations ont une durée de vie limitée
- Le backend valide la propriété de l'opération

### Confirmation Utilisateur

- L'affichage clair du compte correspondant prévient la liaison accidentelle
- Une action explicite de l'utilisateur est requise (pas de liaison automatique)
- L'utilisateur peut toujours choisir de créer un compte séparé

### Validation des Données

- Toute saisie utilisateur est validée côté client et serveur
- La sanitisation du nom d'utilisateur prévient les attaques par injection
- Les limites de longueur du nom d'affichage préviennent les abus

## Intégration avec le Backend

### Point de Terminaison API

**URL:** `POST /xihucalli/user/register`

**Requête d'Acceptation de Liaison:**
```
POST /xihucalli/user/register?register_user_operation_id=uuid-123&client_choice=ACCEPT
```

**Requête de Rejet de Liaison:**
```
POST /xihucalli/user/register?register_user_operation_id=uuid-123&client_choice=REJECT&profile_display_name=Jane%20Doe&profile_username=janedoe
```

**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Exemples d'Utilisation

### Exemple 1: L'Utilisateur Accepte la Liaison

```typescript
// L'utilisateur arrive depuis le callback avec correspondance partielle
// URL: /link-account?operation_id=abc-123&matching_display_name=John%20Smith

// Le composant charge et affiche:
// "Nous avons trouvé un compte existant qui pourrait être le vôtre:"
// "John Smith"
// "Est-ce votre compte?"

// L'utilisateur clique sur "Oui, lier à ce compte"
onAcceptLink() {
  this.loading = true;
  this.errorMessage = null;

  this.registerService.acceptLinkAccount(this.operationId)
    .subscribe({
      next: (response) => {
        // Succès! L'utilisateur est maintenant connecté avec le compte existant
        this.sessionManagement.login(response.token);
        this.router.navigate(['/keyring']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Échec de la liaison du compte. Veuillez réessayer.';
      }
    });
}
```

### Exemple 2: L'Utilisateur Rejette la Liaison et Crée un Nouveau Compte

```typescript
// L'utilisateur clique sur "Non, créer un nouveau compte"
onRejectLink() {
  this.showRegistrationForm = true;
  // Le formulaire apparaît avec les champs nom d'affichage et nom d'utilisateur
}

// L'utilisateur remplit le formulaire:
// Nom d'Affichage: "Jane Doe"
// Nom d'Utilisateur: "janedoe"

// L'utilisateur soumet le formulaire
onSubmitNewAccount() {
  if (this.registerForm.invalid) {
    this.markAllFieldsAsTouched();
    return;
  }

  this.loading = true;
  const { displayName, username } = this.registerForm.value;

  this.registerService.rejectLinkAccount(
    this.operationId,
    displayName,
    username
  ).subscribe({
    next: (response) => {
      // Succès! Nouveau compte créé
      this.sessionManagement.login(response.token);
      this.router.navigate(['/keyring']);
    },
    error: (error) => {
      this.loading = false;
      this.errorMessage = 'Échec de la création du compte. Veuillez réessayer.';
    }
  });
}
```

## Recommandations de Tests

### Tests Unitaires

1. **Initialisation du Composant:**
   - Vérifier que le formulaire s'initialise avec les bons validateurs
   - Vérifier que les paramètres se chargent depuis l'URL
   - Vérifier la gestion d'erreur pour l'ID d'opération manquant

2. **Actions Utilisateur:**
   - Tester que `onAcceptLink()` appelle le service correctement
   - Tester que `onRejectLink()` affiche le formulaire d'inscription
   - Tester que `onSubmitNewAccount()` valide le formulaire avant soumission

3. **Validation du Formulaire:**
   - Tester la validation requise du nom d'affichage
   - Tester la validation du modèle de nom d'utilisateur
   - Tester la génération de message d'erreur

### Tests d'Intégration

1. **Flux d'Acceptation de Liaison:**
   - Naviguer vers la page link-account
   - Vérifier que le nom correspondant s'affiche
   - Cliquer sur le bouton accepter
   - Vérifier que l'appel API est effectué
   - Vérifier la redirection vers la page d'accueil

2. **Flux de Rejet de Liaison:**
   - Naviguer vers la page link-account
   - Cliquer sur le bouton rejeter
   - Vérifier que le formulaire d'inscription apparaît
   - Remplir et soumettre le formulaire
   - Vérifier que l'appel API est effectué
   - Vérifier la redirection vers la page d'accueil

## Accessibilité

- Tous les boutons ont des étiquettes claires
- Les champs de formulaire ont des étiquettes associées
- Les messages d'erreur sont annoncés aux lecteurs d'écran
- La navigation au clavier est entièrement supportée
- Le contraste des couleurs respecte les normes WCAG AA

## Conclusion

Le Système de Liaison de Comptes fournit une méthode sécurisée et conviviale pour gérer les correspondances partielles de compte pendant l'authentification. Il donne aux utilisateurs un contrôle complet sur les décisions de liaison de compte tout en maintenant la sécurité et l'intégrité des données.

