import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './auth/ProtectedRoute.jsx'
import Login          from './pages/Login.jsx'
import Register       from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Onboarding     from './pages/Onboarding.jsx'
import Dashboard      from './pages/Dashboard.jsx'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public / guest-only routes */}
      <Route path="/login"          element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register"       element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password"element={<GuestRoute><ForgotPassword /></GuestRoute>} />

      {/* Onboarding — accessible only after register (no session yet) */}
      <Route path="/onboarding"     element={<Onboarding />} />

      {/* Protected app */}
      <Route path="/app"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="*"               element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
