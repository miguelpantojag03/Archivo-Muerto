# Archivo Muerto — Mapa de navegación

---

## Rutas definidas

| Ruta | Componente | Protección | Descripción |
|---|---|---|---|
| `/login` | `Login.jsx` | `<GuestRoute>` | Inicio de sesión |
| `/register` | `Register.jsx` | `<GuestRoute>` | Registro de cuenta nueva |
| `/forgot-password` | `ForgotPassword.jsx` | `<GuestRoute>` | Recuperación de contraseña |
| `/onboarding` | `Onboarding.jsx` | Pública* | Configuración del primer proyecto |
| `/app` | `Dashboard.jsx` | `<ProtectedRoute>` | Dashboard principal |
| `/*` | — | — | Redirige a `/login` |

> *`/onboarding` es pública para que funcione tras el registro, antes de que exista sesión. Solo se accede via `navigate('/onboarding', { state })` desde Register.

---

## Flujos de usuario

### 1. Usuario nuevo — Registro

```
/register
  │  Completa el formulario (nombre, email, contraseña)
  │  signUp() → crea el usuario en localStorage (sin sesión aún)
  ▼
/onboarding
  │  Introduce el nombre del primer proyecto (default: "Nebula System")
  │  setActiveProject() + signIn() → crea la sesión
  ▼
/app  ✓
```

### 2. Usuario existente — Login

```
/login
  │  Introduce email + contraseña
  │  signIn() → verifica hash, crea sesión (localStorage o sessionStorage)
  ▼
/app  ✓  (o la ruta original si fue redirigido)
```

> El botón **"Use demo account"** rellena `julian@archivomuerto.com / Demo1234!` automáticamente.

### 3. Contraseña olvidada

```
/login  →  "Forgot password?"
  ▼
/forgot-password
  │  Introduce email
  │  resetPassword() → simula envío (siempre éxito, sin revelar si existe el email)
  ▼
Estado de éxito inline  →  "Back to sign in"  →  /login
```

### 4. Cierre de sesión

```
Dashboard (Sidebar)
  │  Click en ⚙ (engranaje junto al usuario)
  │  UserMenu desplegable: Profile · Settings · Sign out
  │  Click "Sign out"  →  signOut() limpia localStorage/sessionStorage
  ▼
/login  (+ toast "Signed out.")
```

### 5. Sesión expirada (7 días)

```
Usuario regresa a la app tras expiración
  ▼
ProtectedRoute → getSession() detecta expiresAt superado → limpia sesión
  ▼
/login  (+ toast "Your session expired. Please sign in again.")
```

### 6. Acceso directo a ruta protegida sin sesión

```
Usuario intenta ir a /app sin estar autenticado
  ▼
<ProtectedRoute> redirige a /login?  (guarda { from: "/app" } en location.state)
  ▼
Tras login exitoso → navega a la ruta original (/app)
```

### 7. Usuario ya autenticado intenta ir a /login o /register

```
<GuestRoute> detecta status === "authenticated"
  ▼
Redirige a /app  (sin pasar por el formulario)
```

---

## Diagrama de flujo completo

```
                    ┌─────────────────────────────────────┐
                    │           Arranque de la app         │
                    │  AuthProvider.getSession()           │
                    └──────────────┬──────────────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               ▼                   ▼                   ▼
          "loading"          "authenticated"    "unauthenticated"
          (spinner)               │                    │
                                  ▼                    ▼
                              /app ✓              /login, /register
                                                  /forgot-password


  /login ──────────────────────────────────────────────────────────┐
    │                                                               │
    ├── Login correcto ──────────────────────────────────► /app ✓  │
    │                                                               │
    ├── "Forgot password?" ─────────────────► /forgot-password     │
    │       └── Éxito ──────────────────────────────────► /login   │
    │                                                               │
    └── "Create an account" ────────────────► /register            │
            │                                                       │
            └── Registro correcto ──────────► /onboarding          │
                    └── Proyecto creado ──────────────────► /app ✓ │
                                                                    │
  /app ◄──────────────────────────────────────────────────────────-┘
    │
    ├── Topbar: búsqueda en tiempo real (filtra por título / descripción)
    ├── Topbar: filtros All · Visuals · Drafts
    ├── Topbar: "+ New Relic" → modal → añade relic al grid
    │
    ├── Grid: click en tarjeta → actualiza panel "Relic Details"
    ├── Grid: hover → opacidad 100%
    ├── Grid: drag → Revival Zone → revive relic (badge REVIVED)
    │
    ├── Relic Details: "Revive Now" → actualiza estado en localStorage
    ├── Relic Details: "Delete Forever" → confirmación → elimina relic
    │
    └── Sidebar: ⚙ → UserMenu
                       ├── Profile   (no-op en demo)
                       ├── Settings  (no-op en demo)
                       └── Sign out ─────────────────► /login
```

---

## Navegación interna del Dashboard

El Dashboard no usa sub-rutas. La navegación del sidebar (The Gallery, Projects, Recent Relics, Permanently Deleted) es **estado local** — cambia el ítem activo visualmente pero no cambia la URL. Toda la funcionalidad principal está en `/app`.

---

## Guards y redirecciones — resumen

| Situación | Comportamiento |
|---|---|
| Sin sesión → `/app` | Redirige a `/login` (guarda `from`) |
| Con sesión → `/login` | Redirige a `/app` |
| Con sesión → `/register` | Redirige a `/app` |
| Con sesión → `/forgot-password` | Redirige a `/app` |
| Ruta desconocida `/*` | Redirige a `/login` |
| Sesión expirada al cargar `/app` | Limpia sesión → redirige a `/login` + toast |
| Login exitoso con `from` guardado | Navega a la ruta original |
