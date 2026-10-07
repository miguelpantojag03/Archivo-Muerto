import { StrictMode, Component, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './index.css'
import './i18n/index.js'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { ToastProvider } from './components/Toast.jsx'
import AppRouter from './AppRouter.jsx'
import { hasUnsavedChanges } from './lib/windowCloseGuard.js'

// ── Close guard ─────────────────────────────────────────────────────
// Blocks a native window close while a modal has unsaved form data, so
// the desktop app can't silently discard it the way a browser tab would.
// No-ops outside the Tauri runtime (e.g. `vite dev` in a plain browser).
function CloseGuard() {
  const { t } = useTranslation()
  useEffect(() => {
    if (!window.__TAURI_INTERNALS__) return
    let unlisten
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
      getCurrentWindow().onCloseRequested((event) => {
        if (hasUnsavedChanges() && !window.confirm(t('app.unsavedChangesConfirm'))) {
          event.preventDefault()
        }
      }).then(fn => { unlisten = fn })
    })
    return () => unlisten?.()
  }, [t])
  return null
}

// ── Error boundary — muestra el error exacto en pantalla ──────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: 'monospace', padding: 32,
          background: '#0E1114', color: '#C97B6E',
          minHeight: '100vh', whiteSpace: 'pre-wrap',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            ❌ Runtime Error — copia esto y reportalo:
          </div>
          <div style={{ fontSize: 13, color: '#ECEEF0' }}>
            {this.state.error?.message}
          </div>
          <div style={{ fontSize: 11, color: '#949CA6', marginTop: 12 }}>
            {this.state.error?.stack}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <HashRouter>
            <AuthProvider>
              <ToastProvider>
                <CloseGuard />
                <AppRouter />
              </ToastProvider>
            </AuthProvider>
          </HashRouter>
        </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>
)
