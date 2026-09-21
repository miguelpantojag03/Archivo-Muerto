import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import {
  Field, Input, PasswordInput, PrimaryButton,
  GlobalError, Divider,
} from '../components/FormField.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useToast } from '../components/Toast.jsx'
import { loginSchema } from '../lib/validators.js'

export default function Login() {
  const { signIn } = useAuth()
  const { push }   = useToast()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || '/app'

  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading]         = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  async function onSubmit(data) {
    setGlobalError('')
    setLoading(true)
    try {
      await signIn(data.email, data.password, data.remember)
      push('Welcome back!', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setValue('email', 'julian@archivomuerto.com')
    setValue('password', 'Demo1234!')
    setValue('remember', true)
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8E8F0', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 13, color: '#7E7EA0' }}>
          Sign in to enter your museum of ideas.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <Field label="Email" error={errors.email?.message}>
          <Input
            register={register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <PasswordInput
            register={register('password')}
            placeholder="Your password"
            autoComplete="current-password"
            error={errors.password}
          />
        </Field>

        {/* Remember me + forgot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12, color: '#A0A0CC' }}>
            <input
              type="checkbox"
              {...register('remember')}
              style={{ accentColor: '#5B4BFF', width: 14, height: 14 }}
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            style={{ fontSize: 12, color: '#7B6FFF', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = '#E8E8F0'}
            onMouseLeave={e => e.target.style.color = '#7B6FFF'}
          >
            Forgot password?
          </Link>
        </div>

        <GlobalError message={globalError} />

        <PrimaryButton loading={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </PrimaryButton>

        <Divider label="or" />

        {/* Google (visual/demo only) */}
        <button
          type="button"
          onClick={() => push('Google sign-in is not available in the demo.', 'info')}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 8,
            background: 'transparent', border: '1px solid #2A2A48',
            color: '#C8C8E0', fontSize: 13, fontWeight: 500,
            fontFamily: 'inherit', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#5B4BFF'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A48'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Demo account fill */}
        <button
          type="button"
          onClick={fillDemo}
          style={{
            width: '100%', padding: '7px 0', borderRadius: 8,
            background: 'rgba(91,75,255,0.08)', border: '1px solid rgba(91,75,255,0.25)',
            color: '#7B6FFF', fontSize: 12, fontWeight: 500,
            fontFamily: 'inherit', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,75,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,75,255,0.08)'}
        >
          Use demo account
        </button>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#7E7EA0', marginTop: 4 }}>
          New here?{' '}
          <Link
            to="/register"
            style={{ color: '#7B6FFF', textDecoration: 'none', fontWeight: 600 }}
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
