# Système de Gestion de Session

## Vue d'ensemble

Le Système de Gestion de Session fournit une solution complète pour gérer les sessions d'authentification des utilisateurs dans l'application. Il gère le cycle de vie complet des sessions utilisateur, y compris le rafraîchissement automatique des jetons, la détection d'expiration de session et la fonctionnalité de déconnexion sécurisée.

## Fonctionnalités

- **Rafraîchissement Automatique des Jetons**: Rafraîchit automatiquement les jetons d'accès avant leur expiration
- **Détection d'Expiration de Session**: Surveille la validité de la session et gère les sessions expirées avec élégance
- **Déconnexion Sécurisée**: Nettoie correctement toutes les données de session et les jetons
- **Déconnexion Forcée**: Gère les scénarios de déconnexion forcée avec suivi des raisons
- **Gestion de l'État de Session**: Maintient l'état d'authentification dans toute l'application

## Architecture

Le Système de Gestion de Session se compose de quatre composants principaux:

### 1. TokenStorageService
Gère le stockage et la récupération sécurisés des jetons d'authentification.

**Méthodes Clés:**
- `storeToken(token: string)`: Stocker le jeton d'accès
- `storeRefreshToken(refreshToken: string)`: Stocker le jeton de rafraîchissement
- `getToken()`: Récupérer le jeton d'accès actuel
- `getRefreshToken()`: Récupérer le jeton de rafraîchissement
- `clearTokens()`: Supprimer tous les jetons stockés
- `isTokenValid()`: Vérifier si le jeton actuel est valide
- `getTokenExpirationTime()`: Obtenir l'horodatage d'expiration du jeton
- `isTokenExpiringSoon(bufferSeconds)`: Vérifier si le jeton expirera bientôt

### 2. TokenRefreshService
Gère le rafraîchissement et le renouvellement automatiques des jetons.

**Méthodes Clés:**
- `refreshToken()`: Rafraîchir manuellement le jeton d'accès
- `startAutoRefresh()`: Commencer la surveillance automatique du rafraîchissement des jetons
- `stopAutoRefresh()`: Arrêter le rafraîchissement automatique des jetons

**Comportement:**
- Rafraîchit automatiquement les jetons 5 minutes avant l'expiration
- Gère les échecs de rafraîchissement en nettoyant les jetons et en déclenchant la déconnexion
- Reprogramme le prochain rafraîchissement après un renouvellement réussi

### 3. SessionExpirationDetector
Surveille la validité de la session et détecte les sessions expirées.

**Méthodes Clés:**
- `startMonitoring()`: Commencer la surveillance de l'expiration de session
- `stopMonitoring()`: Arrêter la surveillance de l'expiration de session

**Comportement:**
- Vérifie la validité de la session toutes les 60 secondes
- Redirige vers la page de connexion lorsque la session expire
- Ajoute le paramètre `sessionExpired=true` pour le retour utilisateur

### 4. SessionManagementService
Orchestre toutes les opérations de gestion de session.

**Méthodes Clés:**
- `login(token, refreshToken?)`: Initialiser une nouvelle session utilisateur
- `logout()`: Terminer la session utilisateur et nettoyer
- `forceLogout(reason?)`: Forcer la déconnexion avec raison optionnelle
- `isAuthenticated()`: Vérifier l'état d'authentification actuel
- `getUserEmail()`: Obtenir l'email de l'utilisateur authentifié
- `getUserId()`: Obtenir l'ID de l'utilisateur authentifié
- `getUsername()`: Obtenir le nom d'utilisateur authentifié

**Observables:**
- `isAuthenticated$`: Flux observable de l'état d'authentification

## Exemples d'Utilisation

### Exemple 1: Flux de Connexion Basique

```typescript
import { Component, inject } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-login',
  template: '...'
})
export class LoginComponent {
  private sessionManagement = inject(SessionManagementService);

  handleSuccessfulLogin(accessToken: string, refreshToken: string): void {
    this.sessionManagement.login(accessToken, refreshToken);
  }
}
```

### Exemple 2: Déconnexion

```typescript
import { Component, inject } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-user-menu',
  template: '...'
})
export class UserMenuComponent {
  private sessionManagement = inject(SessionManagementService);

  handleLogout(): void {
    this.sessionManagement.logout();
  }
}
```

### Exemple 3: Vérifier l'État d'Authentification

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-dashboard',
  template: '...'
})
export class DashboardComponent implements OnInit {
  private sessionManagement = inject(SessionManagementService);
  isAuthenticated = false;

  ngOnInit(): void {
    this.sessionManagement.isAuthenticated$.subscribe(
      authenticated => this.isAuthenticated = authenticated
    );
  }
}
```

### Exemple 4: Afficher les Informations de l'Utilisateur

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-user-profile',
  template: '...'
})
export class UserProfileComponent implements OnInit {
  private sessionManagement = inject(SessionManagementService);
  userEmail: string | null = null;
  username: string | null = null;

  ngOnInit(): void {
    this.userEmail = this.sessionManagement.getUserEmail();
    this.username = this.sessionManagement.getUsername();
  }
}
```

### Exemple 5: Rafraîchissement Manuel du Jeton

```typescript
import { Component, inject } from '@angular/core';
import { TokenRefreshService } from '@commons/session';

@Component({
  selector: 'app-settings',
  template: '...'
})
export class SettingsComponent {
  private tokenRefresh = inject(TokenRefreshService);

  refreshSession(): void {
    this.tokenRefresh.refreshToken().subscribe({
      next: () => console.log('Jeton rafraîchi avec succès'),
      error: (error) => console.error('Échec du rafraîchissement du jeton', error)
    });
  }
}
```

## Intégration de l'Intercepteur HTTP

L'`AuthInterceptor` automatiquement:
- Attache les jetons JWT aux requêtes authentifiées
- Détecte les réponses 401 Non Autorisé
- Déclenche la déconnexion forcée en cas d'échecs d'authentification
- Nettoie les jetons invalides ou expirés

Aucune configuration supplémentaire n'est requise une fois l'intercepteur enregistré dans les fournisseurs de l'application.

## Cycle de Vie de la Session

1. **Initialisation de Session** (Connexion)
   - Stocker les jetons d'accès et de rafraîchissement
   - Démarrer le rafraîchissement automatique des jetons
   - Commencer la surveillance de l'expiration de session
   - Mettre à jour l'état d'authentification

2. **Session Active**
   - Surveiller l'expiration du jeton (toutes les 60 secondes)
   - Auto-rafraîchir le jeton (5 minutes avant l'expiration)
   - Intercepter les requêtes HTTP avec le jeton
   - Gérer les erreurs 401 avec déconnexion forcée

3. **Terminaison de Session** (Déconnexion)
   - Arrêter la surveillance du rafraîchissement des jetons
   - Arrêter la détection d'expiration
   - Nettoyer tous les jetons stockés
   - Réinitialiser l'état d'authentification
   - Rediriger vers la page de connexion

## Configuration

Le système utilise la configuration d'environnement:

```typescript
export const environment = {
  isAuthenticationEnabled: true,
  xihucalliAuthAPIHostname: 'https://api.example.com',
  loginEndpoint: '/login-check'
};
```

## Considérations de Sécurité

- Les jetons sont stockés dans `localStorage` pour la persistance
- Les jetons sont automatiquement nettoyés en cas d'expiration ou d'erreur
- Les jetons de rafraîchissement sont utilisés pour obtenir de nouveaux jetons d'accès
- Toutes les opérations de nettoyage de session sont exhaustives et sécurisées
- Les réponses 401 déclenchent une terminaison immédiate de la session

## Gestion des Erreurs

Le système gère divers scénarios d'erreur:

- **Jeton Invalide**: Automatiquement nettoyé et utilisateur redirigé vers la connexion
- **Jeton Expiré**: Détecté et session terminée avec élégance
- **Échec de Rafraîchissement**: Jetons nettoyés et déconnexion forcée initiée
- **Erreurs Réseau**: Propagées à l'appelant pour gestion
- **401 Non Autorisé**: Déconnexion forcée immédiate avec nettoyage de session

## Meilleures Pratiques

1. Toujours utiliser `SessionManagementService` pour les opérations de connexion/déconnexion
2. S'abonner à `isAuthenticated$` pour l'état d'authentification réactif
3. Laisser le rafraîchissement automatique des jetons gérer le renouvellement
4. Ne pas gérer les jetons manuellement sauf si absolument nécessaire
5. Utiliser `forceLogout()` avec des raisons pour les pistes d'audit
6. Gérer l'expiration de session avec élégance dans l'interface utilisateur

