import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import './i18n/index.js'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { ToastProvider } from './components/Toast.jsx'
import AppRouter from './AppRouter.jsx'

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
      <ThemeProvider>
        <HashRouter>
          <AuthProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </AuthProvider>
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
