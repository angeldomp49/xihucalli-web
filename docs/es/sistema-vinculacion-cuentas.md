# Sistema de Vinculación de Cuentas

## Descripción General

El Sistema de Vinculación de Cuentas permite a los usuarios vincular su proveedor de autenticación externo (Google, AWS Cognito, etc.) con una cuenta de usuario interna existente cuando se detecta una coincidencia parcial durante el proceso de autenticación.

## Arquitectura

### Componentes

1. **LinkAccountPageComponent**: Componente UI principal para decisiones de vinculación de cuentas
2. **RegisterUserService**: Servicio para comunicación API con endpoints de registro
3. **SessionManagementService**: Gestiona la sesión del usuario después de una vinculación exitosa
4. **AuthCallbackPageComponent**: Enruta usuarios a la página de vinculación cuando se detecta coincidencia parcial

## Flujo de Usuario

### Escenario: Coincidencia Parcial Detectada

Cuando un usuario se autentica con un proveedor externo y el backend detecta una coincidencia parcial (ej. email o nombre coincidente), ocurre el siguiente flujo:

```
Autenticación Externa Exitosa
        ↓
Callback del Backend
        ↓
Coincidencia Parcial Detectada
        ↓
AuthCallbackPageComponent
        ↓
Navegar a /link-account
        ↓
LinkAccountPageComponent
```

### Puntos de Decisión del Usuario

#### Opción 1: Aceptar Vinculación (Vincular a Cuenta Existente)

**Flujo:**
1. Usuario ve información de cuenta coincidente
2. Usuario hace clic en "Sí, vincular a esta cuenta"
3. Sistema llama al backend con `client_choice=ACCEPT`
4. Backend vincula login externo a usuario maestro existente
5. Sistema recibe token JWT
6. Usuario inicia sesión y es redirigido a página de inicio

**Llamada API:**
```typescript
registerService.acceptLinkAccount(operationId)
  .subscribe({
    next: (response) => {
      sessionManagement.login(response.token);
      router.navigate(['/keyring']);
    }
  });
```

#### Opción 2: Rechazar Vinculación (Crear Nueva Cuenta)

**Flujo:**
1. Usuario ve información de cuenta coincidente
2. Usuario hace clic en "No, crear una nueva cuenta"
3. Aparece formulario de registro
4. Usuario completa nombre de visualización y nombre de usuario
5. Sistema llama al backend con `client_choice=REJECT` y datos de perfil
6. Backend crea nuevo usuario maestro y vincula login externo
7. Sistema recibe token JWT
8. Usuario inicia sesión y es redirigido a página de inicio

**Llamada API:**
```typescript
registerService.rejectLinkAccount(operationId, displayName, username)
  .subscribe({
    next: (response) => {
      sessionManagement.login(response.token);
      router.navigate(['/keyring']);
    }
  });
```

## Detalles del Componente

### LinkAccountPageComponent

**Ubicación:** `src/app/pages/link-account-page/`

**Responsabilidades:**
- Mostrar información de cuenta coincidente del backend
- Presentar opciones claras de aceptar/rechazar al usuario
- Mostrar formulario de registro al rechazar
- Validar entrada de usuario para creación de nueva cuenta
- Manejar llamadas y respuestas de API
- Gestionar estados de carga y error

**Propiedades Clave:**
- `matchingDisplayName`: Nombre de visualización de la cuenta potencialmente coincidente
- `operationId`: UUID de la operación de registro
- `showRegistrationForm`: Booleano para alternar entre vistas de decisión y registro
- `loading`: Estado de carga durante llamadas API
- `errorMessage`: Visualización de mensaje de error

**Métodos Clave:**
- `onAcceptLink()`: Manejar aceptación de vinculación por usuario
- `onRejectLink()`: Manejar rechazo de vinculación por usuario
- `onSubmitNewAccount()`: Manejar envío de formulario de nueva cuenta
- `loadParameters()`: Extraer parámetros de consulta de URL

### Parámetros URL

El componente espera los siguientes parámetros de consulta:

- `operation_id` (requerido): UUID del callback de autenticación
- `operation_type` (opcional): Tipo de operación (para contexto)
- `matching_display_name` (requerido): Nombre de visualización de cuenta coincidente

**Ejemplo URL:**
```
/link-account?operation_id=550e8400-e29b-41d4-a716-446655440000&matching_display_name=John%20Doe
```

## Características UI/UX

### Diseño Visual

- Layout limpio y moderno basado en tarjetas
- Fondo con gradiente púrpura para consistencia
- Icono de avatar de usuario para visualización de cuenta coincidente
- Tipografía clara y legible
- Diseño responsivo para móvil y escritorio

### Experiencia de Usuario

1. **Visualización Clara de Información:**
   - Muestra nombre de cuenta coincidente de forma prominente
   - Usa tarjeta visual para resaltar la coincidencia
   - Pregunta clara: "¿Es esta tu cuenta?"

2. **Botones de Acción Obvios:**
   - Botón primario (gradiente púrpura): "Sí, vincular a esta cuenta"
   - Botón secundario (gris): "No, crear una nueva cuenta"
   - Botones grandes y amigables al tacto

3. **Divulgación Progresiva:**
   - Formulario de registro solo aparece después del rechazo
   - Reduce carga cognitiva
   - Flujo claro de ida y vuelta

4. **Retroalimentación y Validación:**
   - Validación de formulario en tiempo real
   - Mensajes de error claros
   - Spinner de carga durante llamadas API
   - Redirección automática al éxito

## Validación de Formulario

Al crear una nueva cuenta después del rechazo, aplican las siguientes reglas de validación:

### Nombre de Visualización
- **Requerido:** Sí
- **Longitud Mínima:** 2 caracteres
- **Mensaje de Error:** "El nombre de visualización es requerido" / "El nombre de visualización debe tener al menos 2 caracteres"

### Nombre de Usuario
- **Requerido:** Sí
- **Longitud Mínima:** 3 caracteres
- **Patrón:** Solo caracteres alfanuméricos, guiones y guiones bajos
- **Regex:** `/^[a-zA-Z0-9_-]+$/`
- **Mensajes de Error:**
  - "El nombre de usuario es requerido"
  - "El nombre de usuario debe tener al menos 3 caracteres"
  - "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos"

## Manejo de Errores

### Errores del Lado del Cliente

1. **ID de Operación Faltante:**
   - Mensaje: "Solicitud inválida. Falta ID de operación."
   - Acción: Mostrar error, prevenir acciones

2. **Errores de Validación de Formulario:**
   - Mensaje: Mensajes de error específicos del campo
   - Acción: Resaltar campos inválidos, mostrar texto de error

### Errores del Lado del Servidor

1. **Registro Fallido:**
   - Mensaje: Mensaje de error del backend o "Operación fallida. Por favor intenta de nuevo."
   - Acción: Mostrar error, permitir reintento

2. **Errores de Red:**
   - Mensaje: "Operación fallida. Por favor intenta de nuevo."
   - Acción: Mostrar error, permitir reintento

## Consideraciones de Seguridad

### Protección de ID de Operación

- Los IDs de operación son UUIDs para prevenir enumeración
- Cada operación solo puede procesarse una vez
- Las operaciones tienen un tiempo de vida limitado
- El backend valida la propiedad de la operación

### Confirmación de Usuario

- Visualización clara de cuenta coincidente previene vinculación accidental
- Se requiere acción explícita del usuario (sin vinculación automática)
- El usuario siempre puede elegir crear cuenta separada

### Validación de Datos

- Toda entrada de usuario se valida en cliente y servidor
- La sanitización de nombre de usuario previene ataques de inyección
- Límites de longitud de nombre de visualización previenen abuso

## Integración con Backend

### Endpoint API

**URL:** `POST /xihucalli/user/register`

**Solicitud de Aceptar Vinculación:**
```
POST /xihucalli/user/register?register_user_operation_id=uuid-123&client_choice=ACCEPT
```

**Solicitud de Rechazar Vinculación:**
```
POST /xihucalli/user/register?register_user_operation_id=uuid-123&client_choice=REJECT&profile_display_name=Jane%20Doe&profile_username=janedoe
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Ejemplos de Uso

### Ejemplo 1: Usuario Acepta Vinculación

```typescript
// Usuario llega desde callback con coincidencia parcial
// URL: /link-account?operation_id=abc-123&matching_display_name=John%20Smith

// Componente carga y muestra:
// "Encontramos una cuenta existente que podría ser tuya:"
// "John Smith"
// "¿Es esta tu cuenta?"

// Usuario hace clic en "Sí, vincular a esta cuenta"
onAcceptLink() {
  this.loading = true;
  this.errorMessage = null;

  this.registerService.acceptLinkAccount(this.operationId)
    .subscribe({
      next: (response) => {
        // ¡Éxito! Usuario ahora está conectado con cuenta existente
        this.sessionManagement.login(response.token);
        this.router.navigate(['/keyring']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Fallo al vincular cuenta. Por favor intenta de nuevo.';
      }
    });
}
```

### Ejemplo 2: Usuario Rechaza Vinculación y Crea Nueva Cuenta

```typescript
// Usuario hace clic en "No, crear una nueva cuenta"
onRejectLink() {
  this.showRegistrationForm = true;
  // Aparece formulario con entradas de nombre de visualización y usuario
}

// Usuario completa formulario:
// Nombre de Visualización: "Jane Doe"
// Nombre de Usuario: "janedoe"

// Usuario envía formulario
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
      // ¡Éxito! Nueva cuenta creada
      this.sessionManagement.login(response.token);
      this.router.navigate(['/keyring']);
    },
    error: (error) => {
      this.loading = false;
      this.errorMessage = 'Fallo al crear cuenta. Por favor intenta de nuevo.';
    }
  });
}
```

## Recomendaciones de Pruebas

### Pruebas Unitarias

1. **Inicialización de Componente:**
   - Verificar que formulario se inicializa con validadores correctos
   - Verificar que parámetros se cargan desde URL
   - Verificar manejo de error para ID de operación faltante

2. **Acciones de Usuario:**
   - Probar que `onAcceptLink()` llama servicio correctamente
   - Probar que `onRejectLink()` muestra formulario de registro
   - Probar que `onSubmitNewAccount()` valida formulario antes de envío

3. **Validación de Formulario:**
   - Probar validación requerida de nombre de visualización
   - Probar validación de patrón de nombre de usuario
   - Probar generación de mensaje de error

### Pruebas de Integración

1. **Flujo de Aceptar Vinculación:**
   - Navegar a página link-account
   - Verificar que nombre coincidente se muestra
   - Hacer clic en botón aceptar
   - Verificar que llamada API se hace
   - Verificar redirección a página de inicio

2. **Flujo de Rechazar Vinculación:**
   - Navegar a página link-account
   - Hacer clic en botón rechazar
   - Verificar que formulario de registro aparece
   - Completar y enviar formulario
   - Verificar que llamada API se hace
   - Verificar redirección a página de inicio

## Accesibilidad

- Todos los botones tienen etiquetas claras
- Las entradas de formulario tienen etiquetas asociadas
- Los mensajes de error se anuncian a lectores de pantalla
- La navegación por teclado está completamente soportada
- El contraste de color cumple con estándares WCAG AA

## Conclusión

El Sistema de Vinculación de Cuentas proporciona una forma segura y amigable para manejar coincidencias parciales de cuenta durante la autenticación. Brinda a los usuarios control completo sobre las decisiones de vinculación de cuentas mientras mantiene la seguridad e integridad de datos.

