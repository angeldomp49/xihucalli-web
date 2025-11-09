# Componente de Callback de Autenticación

Este documento describe el Componente de Callback de Autenticación que procesa la devolución de llamada del proveedor de autenticación OpenID después de la autenticación del usuario.

## Descripción General

El Componente de Callback de Autenticación maneja la redirección desde el servicio de autenticación del backend después de que el usuario se ha autenticado con un proveedor OpenID (Google, Cognito, etc.). Procesa los parámetros del callback y redirige al usuario al destino apropiado según el resultado de la autenticación.

## Características

- Procesa parámetros de callback de autenticación
- Maneja autenticación exitosa con almacenamiento de token JWT
- Maneja requisitos de registro de usuario
- Maneja decisiones de vinculación de cuentas para coincidencias parciales
- Proporciona manejo de errores y retroalimentación al usuario
- Redirección automática según el estado de autenticación

## Arquitectura

### Estructura del Componente

El componente de callback utiliza los siguientes servicios:

- **AuthCallbackParamsExtractor**: Extrae y valida parámetros del callback desde la URL
- **TokenStorageService**: Almacena tokens JWT en el almacenamiento local
- **Router**: Navega a rutas apropiadas según el estado de autenticación

### Estados de Autenticación

El componente maneja cuatro estados principales:

1. **Éxito**: Usuario autenticado exitosamente, token JWT proporcionado
2. **Registro Requerido**: Autenticación externa exitosa pero el usuario interno no existe
3. **Decisión de Coincidencia Requerida**: Autenticación externa exitosa pero se encontró coincidencia parcial de usuario
4. **Error**: Autenticación fallida o error ocurrido

## Uso

### Configuración de Ruta

La ruta de callback se configura en el enrutamiento de la aplicación:

```typescript
export const routes: Routes = [
  {
    path: "auth/callback",
    component: AuthCallbackPageComponent
  }
];
```

### Parámetros de URL del Callback

El backend redirige a este componente con los siguientes parámetros de consulta:

#### Caso de Éxito
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=SUCCESS&token=eyJhbGc...
```

#### Caso de Registro Requerido
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=NON_EXISTING_USER&register_user_operation_id=abc123&register_user_operation_type=FRESH_INTERNAL_USER
```

#### Caso de Decisión de Coincidencia Requerida
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=PARTIAL_MATCHING_USER&register_user_operation_id=def456&register_user_operation_type=ATTACH_LOGIN_INFORMATION_TO_MASTER_USER&matching_user_display_name=John%20Doe
```

#### Caso de Error
```
/auth/callback?external_authentication_result=FAILURE&error=Invalid+credentials
```

### Flujo del Componente

```typescript
ngOnInit() {
  // Extraer parámetros del callback desde la URL
  const params = paramsExtractor.extractCallbackParams(route);
  
  // Verificar estado de autenticación y redirigir en consecuencia
  if (hasError) {
    handleError();
  } else if (isSuccess) {
    storeToken();
    navigateToHome();
  } else if (requiresRegistration) {
    navigateToRegistration();
  } else if (requiresMatchingDecision) {
    navigateToLinkAccount();
  }
}
```

## Ejemplo de Integración

### Paso 1: Usuario Inicia Sesión

```typescript
// Componente de inicio de sesión
initiateGoogleLogin(): void {
  this.authService.initiateAuthentication('google')
    .subscribe(response => {
      window.location.href = response.authorization_url;
    });
}
```

### Paso 2: Backend Procesa Autenticación

El backend intercambia el código de autorización con el proveedor y redirige de vuelta:

```
https://tu-dominio.com/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=SUCCESS&token=eyJhbGc...
```

### Paso 3: Componente de Callback Procesa el Resultado

```typescript
// AuthCallbackPageComponent procesa automáticamente el callback
private handleAuthenticationSuccess(params: AuthCallbackParams): void {
  if (!params.token) {
    this.handleError({ error: 'No token received from server' });
    return;
  }

  this.tokenStorage.storeToken(params.token);
  this.router.navigate(['/keyring']);
}
```

### Paso 4: Usuario Llega a Ruta Protegida

El usuario es automáticamente redirigido a la página de inicio con el token JWT almacenado.

## Manejo de Errores

El componente proporciona retroalimentación visual para errores:

- Muestra mensaje de error al usuario
- Redirige automáticamente a la página de inicio de sesión después de 3 segundos
- Registra errores en la consola para depuración

Ejemplo de visualización de error:

```html
<div class="error-state">
  <h2>Error de Autenticación</h2>
  <p>{{ errorMessage }}</p>
  <p>Redirigiendo a página de inicio de sesión...</p>
</div>
```

## Consideraciones de Seguridad

1. **Validación de Estado**: El backend valida el parámetro de estado OAuth para prevenir ataques CSRF
2. **Almacenamiento de Token**: Los tokens JWT se almacenan en el almacenamiento local para gestión de sesión
3. **Mensajes de Error**: Se muestran mensajes de error genéricos a los usuarios para evitar divulgación de información
4. **Limpieza Automática**: Los intentos de autenticación fallidos redirigen a la página de inicio de sesión

## Configuración del Entorno

La URL de callback debe configurarse en el entorno:

```typescript
export const environment = {
  callbackRedirectUrl: 'https://tu-dominio.com/auth/callback'
};
```

Esta URL también debe registrarse con los proveedores OpenID (Google, Cognito) como URI de redirección autorizada.

## Componentes Relacionados

- [Servicio de Autenticación OpenID](../infraestructura-autenticacion-openid.md)
- [Iniciador de Autenticación](./external-references/master_user/authentication-initiator.md)
- [Registro de Usuario](./external-references/master_user/register-user.md)
- [Sistema de Relación de Usuarios](./external-references/master_user/user-relationship-system.md)

