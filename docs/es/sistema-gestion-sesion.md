# Sistema de Gestión de Sesión

## Descripción General

El Sistema de Gestión de Sesión proporciona una solución integral para gestionar las sesiones de autenticación de usuarios en la aplicación. Maneja el ciclo de vida completo de las sesiones de usuario, incluyendo la renovación automática de tokens, detección de expiración de sesión y funcionalidad de cierre de sesión seguro.

## Características

- **Renovación Automática de Tokens**: Renueva automáticamente los tokens de acceso antes de que expiren
- **Detección de Expiración de Sesión**: Monitorea la validez de la sesión y maneja sesiones expiradas de forma elegante
- **Cierre de Sesión Seguro**: Limpia adecuadamente todos los datos de sesión y tokens
- **Cierre Forzado de Sesión**: Maneja escenarios de cierre forzado con seguimiento de razones
- **Gestión de Estado de Sesión**: Mantiene el estado de autenticación en toda la aplicación

## Arquitectura

El Sistema de Gestión de Sesión consta de cuatro componentes principales:

### 1. TokenStorageService
Gestiona el almacenamiento y recuperación segura de tokens de autenticación.

**Métodos Clave:**
- `storeToken(token: string)`: Almacenar token de acceso
- `storeRefreshToken(refreshToken: string)`: Almacenar token de renovación
- `getToken()`: Recuperar token de acceso actual
- `getRefreshToken()`: Recuperar token de renovación
- `clearTokens()`: Eliminar todos los tokens almacenados
- `isTokenValid()`: Verificar si el token actual es válido
- `getTokenExpirationTime()`: Obtener marca de tiempo de expiración del token
- `isTokenExpiringSoon(bufferSeconds)`: Verificar si el token expirará pronto

### 2. TokenRefreshService
Maneja la renovación y actualización automática de tokens.

**Métodos Clave:**
- `refreshToken()`: Renovar manualmente el token de acceso
- `startAutoRefresh()`: Iniciar monitoreo automático de renovación de tokens
- `stopAutoRefresh()`: Detener renovación automática de tokens

**Comportamiento:**
- Renueva automáticamente los tokens 5 minutos antes de la expiración
- Maneja fallos de renovación limpiando tokens y activando cierre de sesión
- Reprograma la próxima renovación después de una renovación exitosa

### 3. SessionExpirationDetector
Monitorea la validez de la sesión y detecta sesiones expiradas.

**Métodos Clave:**
- `startMonitoring()`: Iniciar monitoreo de expiración de sesión
- `stopMonitoring()`: Detener monitoreo de expiración de sesión

**Comportamiento:**
- Verifica la validez de la sesión cada 60 segundos
- Redirige a la página de inicio de sesión cuando la sesión expira
- Agrega el parámetro `sessionExpired=true` para retroalimentación del usuario

### 4. SessionManagementService
Orquesta todas las operaciones de gestión de sesión.

**Métodos Clave:**
- `login(token, refreshToken?)`: Inicializar nueva sesión de usuario
- `logout()`: Finalizar sesión de usuario y limpiar
- `forceLogout(reason?)`: Forzar cierre de sesión con razón opcional
- `isAuthenticated()`: Verificar estado de autenticación actual
- `getUserEmail()`: Obtener email del usuario autenticado
- `getUserId()`: Obtener ID del usuario autenticado
- `getUsername()`: Obtener nombre de usuario autenticado

**Observables:**
- `isAuthenticated$`: Flujo observable del estado de autenticación

## Ejemplos de Uso

### Ejemplo 1: Flujo Básico de Inicio de Sesión

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

### Ejemplo 2: Cierre de Sesión

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

### Ejemplo 3: Verificar Estado de Autenticación

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

### Ejemplo 4: Mostrar Información del Usuario

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

### Ejemplo 5: Renovación Manual de Token

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
      next: () => console.log('Token renovado exitosamente'),
      error: (error) => console.error('Fallo en renovación de token', error)
    });
  }
}
```

## Integración del Interceptor HTTP

El `AuthInterceptor` automáticamente:
- Adjunta tokens JWT a las solicitudes autenticadas
- Detecta respuestas 401 No Autorizado
- Activa cierre forzado de sesión en fallos de autenticación
- Limpia tokens inválidos o expirados

No se requiere configuración adicional una vez que el interceptor está registrado en los proveedores de la aplicación.

## Ciclo de Vida de la Sesión

1. **Inicialización de Sesión** (Inicio de Sesión)
   - Almacenar tokens de acceso y renovación
   - Iniciar renovación automática de tokens
   - Comenzar monitoreo de expiración de sesión
   - Actualizar estado de autenticación

2. **Sesión Activa**
   - Monitorear expiración de token (cada 60 segundos)
   - Auto-renovar token (5 minutos antes de expiración)
   - Interceptar solicitudes HTTP con token
   - Manejar errores 401 con cierre forzado

3. **Terminación de Sesión** (Cierre de Sesión)
   - Detener monitoreo de renovación de tokens
   - Detener detección de expiración
   - Limpiar todos los tokens almacenados
   - Restablecer estado de autenticación
   - Redirigir a página de inicio de sesión

## Configuración

El sistema utiliza configuración de entorno:

```typescript
export const environment = {
  isAuthenticationEnabled: true,
  xihucalliAuthAPIHostname: 'https://api.example.com',
  loginEndpoint: '/login-check'
};
```

## Consideraciones de Seguridad

- Los tokens se almacenan en `localStorage` para persistencia
- Los tokens se limpian automáticamente en expiración o error
- Los tokens de renovación se usan para obtener nuevos tokens de acceso
- Todas las operaciones de limpieza de sesión son exhaustivas y seguras
- Las respuestas 401 activan terminación inmediata de sesión

## Manejo de Errores

El sistema maneja varios escenarios de error:

- **Token Inválido**: Automáticamente limpiado y usuario redirigido a inicio de sesión
- **Token Expirado**: Detectado y sesión terminada elegantemente
- **Fallo de Renovación**: Tokens limpiados y cierre forzado iniciado
- **Errores de Red**: Propagados al llamador para manejo
- **401 No Autorizado**: Cierre forzado inmediato con limpieza de sesión

## Mejores Prácticas

1. Siempre usar `SessionManagementService` para operaciones de inicio/cierre de sesión
2. Suscribirse a `isAuthenticated$` para estado de autenticación reactivo
3. Dejar que la renovación automática de tokens maneje la renovación
4. No gestionar tokens manualmente a menos que sea absolutamente necesario
5. Usar `forceLogout()` con razones para seguimiento de auditoría
6. Manejar expiración de sesión elegantemente en la UI

