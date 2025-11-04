# Infraestructura de Autenticación OpenID - Configuración y Servicios

Esta documentación describe la infraestructura de autenticación OpenID implementada en la aplicación Xihucalli, incluyendo configuración, gestión de tokens y servicios de autenticación.

## Descripción General

La aplicación utiliza un flujo de autenticación OpenID personalizado que se integra con proveedores de identidad externos (Google y Cognito) a través de un servicio de autenticación backend. La implementación sigue los principios de Clean Architecture y proporciona una gestión completa del ciclo de vida de autenticación.

## Componentes

### 1. Configuración de Entorno

La configuración de entorno de la aplicación incluye endpoints y configuraciones específicas de OpenID:

```typescript
// environment.development.ts o environment.ts
{
  xihucalliAuthAPIHostname: 'https://api.example.com/xihucalli/user',
  authInitiateEndpoint: '/auth/initiate',
  authCallbackEndpoint: '/auth/callback',
  authRegisterEndpoint: '/register',
  callbackRedirectUrl: 'https://app.example.com/auth/callback'
}
```

### 2. Servicio de Almacenamiento de Tokens

El `TokenStorageService` proporciona almacenamiento y gestión segura de tokens JWT:

**Características:**
- Almacenar y recuperar tokens de acceso
- Almacenar y recuperar tokens de actualización
- Validar expiración de tokens
- Extraer información del payload del token
- Limpiar tokens al cerrar sesión

**Ejemplo de Uso:**

```typescript
import { TokenStorageService } from '@commons/session';

class MyComponent {
  constructor(private tokenStorage: TokenStorageService) {}

  saveToken(token: string): void {
    this.tokenStorage.storeToken(token);
  }

  checkAuthentication(): boolean {
    return this.tokenStorage.isTokenValid();
  }

  getUserInfo(): void {
    const email = this.tokenStorage.getUserEmail();
    const userId = this.tokenStorage.getUserId();
    const username = this.tokenStorage.getUsername();
  }
}
```

### 3. Servicio de Autenticación OpenID

El `OpenIDAuthenticationService` maneja la comunicación con la API de autenticación backend:

**Características:**
- Iniciar flujo de autenticación con proveedores de identidad
- Registrar nuevos usuarios
- Redirigir a URLs de autorización del proveedor

**Ejemplo de Uso:**

```typescript
import { OpenIDAuthenticationService } from '@commons/session';

class LoginComponent {
  constructor(private authService: OpenIDAuthenticationService) {}

  loginWithGoogle(): void {
    this.authService.initiateAuthentication('google')
      .subscribe(response => {
        this.authService.redirectToProvider(response.authorization_url);
      });
  }

  loginWithCognito(): void {
    this.authService.initiateAuthentication('cognito')
      .subscribe(response => {
        this.authService.redirectToProvider(response.authorization_url);
      });
  }
}
```

### 4. Servicio de Gestión de Sesión

El `SessionManagementService` gestiona el ciclo de vida de la sesión del usuario:

**Características:**
- Seguimiento del estado de autenticación
- Estado de autenticación observable
- Operaciones de inicio y cierre de sesión
- Acceso a información del usuario

**Ejemplo de Uso:**

```typescript
import { SessionManagementService } from '@commons/session';

class AppComponent {
  isAuthenticated$ = this.sessionService.isAuthenticated$;

  constructor(private sessionService: SessionManagementService) {}

  login(token: string): void {
    this.sessionService.login(token);
  }

  logout(): void {
    this.sessionService.logout();
  }

  checkAuth(): boolean {
    return this.sessionService.isAuthenticated();
  }
}
```

### 5. Interceptor de Autenticación

El `authInterceptor` adjunta automáticamente tokens JWT a las peticiones HTTP:

**Características:**
- Agrega automáticamente el encabezado Authorization
- Valida el token antes de adjuntarlo
- Limpia tokens inválidos

**Configuración:**

```typescript
// app.config.ts
import { authInterceptor } from '@commons/session';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

### 6. Servicio de Orquestación de Autenticación

El `AuthenticationOrchestrationService` coordina el flujo completo de autenticación:

**Características:**
- Iniciar flujo de autenticación con proveedores
- Completar registro de usuario
- Manejar errores de autenticación
- Coordinar gestión de sesión

**Ejemplo de Uso:**

```typescript
import { AuthenticationOrchestrationService } from '@commons/session';

class LoginComponent {
  constructor(private orchestration: AuthenticationOrchestrationService) {}

  loginWithGoogle(): void {
    this.orchestration.startAuthenticationFlow('google');
  }

  completeRegistration(operationId: string, displayName: string, username: string): void {
    this.orchestration.completeRegistration({
      register_user_operation_id: operationId,
      profile_display_name: displayName,
      profile_username: username
    }).subscribe({
      next: (response) => {
        // Usuario ahora está autenticado y redirigido
      },
      error: (error) => {
        console.error('Registro falló', error);
      }
    });
  }
}
```

### 7. Guard de Autenticación

El `openIDAuthGuard` protege rutas que requieren autenticación:

**Ejemplo de Uso:**

```typescript
// app.routes.ts
import { openIDAuthGuard } from '@commons/session';

export const routes: Routes = [
  {
    path: 'keyring',
    component: KeyringIndexPageComponent,
    canActivate: [openIDAuthGuard]
  },
  {
    path: 'login-check',
    component: LoginCheckPageComponent
  }
];
```

### 8. Extractor de Parámetros de Callback

La utilidad `AuthCallbackParamsExtractor` extrae y valida parámetros de callback:

**Características:**
- Extraer parámetros de consulta de la URL de callback
- Verificar errores
- Determinar tipo de resultado de callback
- Validar estado de autenticación

**Ejemplo de Uso:**

```typescript
import { AuthCallbackParamsExtractor } from '@commons/session';

class CallbackComponent {
  constructor(
    private route: ActivatedRoute,
    private paramsExtractor: AuthCallbackParamsExtractor
  ) {}

  ngOnInit(): void {
    const params = this.paramsExtractor.extractCallbackParams(this.route);

    if (this.paramsExtractor.hasError(params)) {
      this.handleError(params.error);
    } else if (this.paramsExtractor.isSuccess(params)) {
      this.handleSuccess(params.token);
    } else if (this.paramsExtractor.requiresRegistration(params)) {
      this.showRegistrationForm(params.register_user_operation_id);
    } else if (this.paramsExtractor.requiresMatchingDecision(params)) {
      this.showMatchingDialog(params);
    }
  }
}
```

## Flujo de Autenticación

### 1. Iniciar Autenticación

```typescript
// Usuario hace clic en "Iniciar sesión con Google"
orchestrationService.startAuthenticationFlow('google');

// Backend genera URL de autorización
// Usuario es redirigido a Google
```

### 2. Autenticación del Proveedor

```
Usuario se autentica con Google
Google redirige de vuelta al endpoint de callback del backend
Backend valida la autenticación y crea la sesión
```

### 3. Manejo de Callback

```typescript
// Backend redirige a la URL de callback de la aplicación con parámetros
const params = paramsExtractor.extractCallbackParams(route);

if (params.internal_authentication_result === 'SUCCESS') {
  // Usuario ya existe, almacenar token y redirigir
  sessionService.login(params.token);
  router.navigate(['/keyring']);
}

if (params.internal_authentication_result === 'NON_EXISTING_USER') {
  // Mostrar formulario de registro
  showRegistrationForm(params.register_user_operation_id);
}

if (params.internal_authentication_result === 'PARTIAL_MATCHING_USER') {
  // Mostrar confirmación de coincidencia
  showMatchingDialog(params.matching_user_display_name);
}
```

### 4. Registro de Usuario

```typescript
// Usuario completa el formulario de registro
orchestrationService.completeRegistration({
  register_user_operation_id: operationId,
  profile_display_name: 'Juan Pérez',
  profile_username: 'juanperez'
}).subscribe(response => {
  // Token se almacena automáticamente y el usuario es redirigido
});
```

## Tipos e Interfaces

### OpenIDProvider

```typescript
type OpenIDProvider = 'google' | 'cognito';
```

### AuthInitiateResponse

```typescript
interface AuthInitiateResponse {
  authorization_url: string;
  state: string;
  provider: string;
  redirect_url: string;
}
```

### AuthCallbackParams

```typescript
interface AuthCallbackParams {
  external_authentication_result?: string;
  internal_authentication_result?: string;
  register_user_operation_id?: string;
  register_user_operation_type?: string;
  token?: string;
  error?: string;
  matching_user_display_name?: string;
}
```

### RegisterUserRequest

```typescript
interface RegisterUserRequest {
  register_user_operation_id: string;
  client_choice?: 'ACCEPT' | 'REJECT';
  profile_display_name?: string;
  profile_username?: string;
}
```

## Instalación

La infraestructura utiliza las siguientes dependencias:

```bash
npm install jwt-decode
```

## Configuración

Agrega lo siguiente a tus archivos de entorno:

```typescript
export const environment = {
  xihucalliAuthAPIHostname: 'TU_HOSTNAME_API',
  authInitiateEndpoint: '/auth/initiate',
  authCallbackEndpoint: '/auth/callback',
  authRegisterEndpoint: '/register',
  callbackRedirectUrl: 'TU_URL_CALLBACK_APP'
};
```

Registra el interceptor de autenticación en `app.config.ts`:

```typescript
import { authInterceptor } from '@commons/session';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

