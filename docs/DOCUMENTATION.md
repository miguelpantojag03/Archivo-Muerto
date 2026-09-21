# Archivo Muerto — Documentación técnica

> Versión: 0.0.0 · Stack: React 19 + Vite 8 + Tailwind CSS 4 · Fecha: Sep 2026

---

## Descripción general

**Archivo Muerto** es una aplicación web para equipos creativos que permite guardar, organizar y revivir ideas descartadas (borradores, paletas, bocetos, copies, notas) como *Relics* (reliquias). Funciona como un museo de ideas: lo que se descarta no se pierde, se archiva y puede volver a un proyecto activo en cualquier momento.

---

## Stack tecnológico

| Capa | Librería / Herramienta | Versión |
|---|---|---|
| UI framework | React | ^19.3.0 |
| Build tool | Vite | ^8.3.0 |
| Estilos | Tailwind CSS (v4 via plugin) | ^4.3.3 |
| Routing | React Router DOM | ^7.18.4 |
| Formularios | React Hook Form | ^7.88.0 |
| Validación | Zod | ^4.6.5 |
| Iconos | Lucide React | ^1.47.0 |
| Tipografía | Space Grotesk (Google Fonts) | — |

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo (abre en http://localhost:5173 ó 5174)
npm run dev

# 3. Build de producción
npm run build

# 4. Preview del build
npm run preview
```

### Credenciales demo precargadas

```
Email:    julian@archivomuerto.com
Password: Demo1234!
```

> En la pantalla de login hay un botón **"Use demo account"** que rellena las credenciales automáticamente.

---

## Design Tokens

Definidos en `src/index.css` como variables CSS y aplicados via estilos inline en todos los componentes.

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#14142B` | Fondo general |
| `surface` | `#0F0F22` | Sidebar, panel derecho |
| `surface-2` | `#1A1A35` | Tarjetas, modales |
| `accent` | `#5B4BFF` | Botones primarios, ítem activo, bordes de selección |
| `accent-light` | `#7B6FFF` | Badges de categoría, links |
| `text` | `#E8E8F0` | Títulos y texto principal |
| `muted` | `#7E7EA0` | Metadatos, descripciones, placeholders |
| `error` | `#E05555` | Mensajes de error (coral apagado) |
| `border` | `#2A2A48` | Bordes de inputs y tarjetas |
| `border-light` | `#1E1E3A` | Divisores sutiles |

**Radios:** cards `12px` · thumbnails `8px` · botones `8px` · pills `999px`  
**Espaciado:** sidebar `200px` · panel derecho `260px` · gap del grid `14px`

---

## Capa de autenticación

### Interfaz `AuthService` (`src/auth/AuthService.js`)

Define el contrato que toda implementación debe cumplir:

```js
signIn(email, password, remember)   → Promise<Session>
signUp(email, password, fullName)   → Promise<User>
signOut()                           → Promise<void>
getSession()                        → Promise<Session | null>
resetPassword(email)                → Promise<void>
setActiveProject(userId, name)      → Promise<void>
onAuthStateChange(callback)         → () => void   // retorna unsuscribe
```

### `MockAuthService` (`src/auth/MockAuthService.js`)

Implementación mock basada en `localStorage`. Simula latencia de ~600 ms.

- Contraseñas hasheadas con `btoa` + salt (`src/lib/hash.js`). **No usar en producción.**
- Sesiones persistidas como JSON en `localStorage` (remember me) o `sessionStorage`.
- Expiración: 7 días desde el sign in.
- Usuario demo precargado automáticamente en el primer arranque.

> ⚠️ Para conectar Supabase o Firebase, crear una nueva clase que implemente el mismo contrato y reemplazar la línea `const authService = MockAuthService` en `AuthProvider.jsx`.

### `AuthProvider` (`src/auth/AuthProvider.jsx`)

Contexto React que expone:

```js
{ user, status, signIn, signUp, signOut, resetPassword, setActiveProject }
```

`status`: `"loading"` | `"authenticated"` | `"unauthenticated"`

### `ProtectedRoute` / `GuestRoute` (`src/auth/ProtectedRoute.jsx`)

- `<ProtectedRoute>` — redirige a `/login` si no hay sesión, preservando la ruta de destino en `location.state.from`.
- `<GuestRoute>` — redirige a `/app` si ya hay sesión activa.

---

## Módulo de Relics

### Tipos de categoría

| Categoría | Filtro | Thumbnail |
|---|---|---|
| SKETCH | visuals | Fondo gris con líneas y puntos SVG |
| COPYWRITING | drafts | Fondo oscuro con líneas de texto |
| PALETTE | visuals | 3 franjas de color verticales |
| BRANDING | visuals | Fondo oscuro con glifo SVG |
| NOTES | drafts | Fondo oscuro con comilla tipográfica |

### `relicStorage.js` (`src/lib/relicStorage.js`)

CRUD sobre `localStorage` con clave `am_relics_{userId}`.

```js
getRelics(userId)              → Relic[]
saveRelics(userId, relics)     → void
addRelic(userId, relic)        → Relic[]
updateRelic(userId, id, patch) → Relic[]
deleteRelic(userId, id)        → Relic[]
```

Al primer acceso del usuario demo, se precargan los 5 relics de la captura (`src/data/mockRelics.js`). Un usuario nuevo empieza con array vacío.

---

## Validación de formularios

Definida en `src/lib/validators.js` con Zod:

| Schema | Campos | Reglas especiales |
|---|---|---|
| `loginSchema` | email, password, remember | — |
| `registerSchema` | fullName, email, password, confirmPassword, terms | Password: mín 8 chars, 1 mayúscula, 1 número, 1 especial · passwords iguales |
| `forgotSchema` | email | — |
| `onboardingSchema` | projectName | Máx 40 chars |

`passwordStrength(password)` devuelve un score de 0–4 usado por el medidor visual.

---

## Componentes reutilizables

### `FormField.jsx`
- `<Field>` — wrapper con label + mensaje de error accesible (`role="alert"`, `aria-live`)
- `<Input>` — input con estilos de error y focus ring violeta
- `<PasswordInput>` — igual que Input + toggle mostrar/ocultar
- `<PrimaryButton>` — botón submit con estado de carga (spinner)
- `<GlobalError>` — franja de error global del formulario
- `<Divider>` — separador con texto centrado
- `<Spinner>` — SVG animado

### `Toast.jsx`
Sistema de notificaciones global via contexto. Uso:
```js
const { push } = useToast()
push('Mensaje', 'success' | 'error' | 'info', durationMs)
```

### `Modal.jsx`
Modal genérico con backdrop, cierre por Escape y por click fuera. Animaciones de entrada con CSS keyframes.

---

## Accesibilidad

- Todos los campos tienen `<label>` asociado.
- Errores con `aria-invalid` y `aria-live="polite"`.
- Errores globales con `aria-live="assertive"`.
- Navegación completa por teclado. Enter envía formularios.
- Focus visible con anillo violeta en todos los elementos interactivos.
- Botones deshabilitados durante peticiones en curso.

---

## Notas de producción

1. Reemplazar `MockAuthService` por una implementación real (Supabase/Firebase).
2. Nunca almacenar credenciales en el cliente — el hash simulado en `lib/hash.js` **no es seguro**.
3. Servir la app por HTTPS.
4. Configurar `Content-Security-Policy` adecuado.
5. La función `window.confirm` en `handleDelete` del Dashboard debe reemplazarse por un modal de confirmación propio en producción.
