import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import {
  Field, Input, PasswordInput, PrimaryButton, GlobalError,
} from '../components/FormField.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useToast } from '../components/Toast.jsx'
import { registerSchema, passwordStrength } from '../lib/validators.js'

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Strong']
const STRENGTH_COLORS = ['#E05555', '#E08855', '#E0C855', '#4ADE80']

function PasswordStrengthMeter({ password }) {
  const score = passwordStrength(password || '')
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 99,
              background: i < score ? STRENGTH_COLORS[score - 1] : '#2A2A48',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      {password && (
        <span style={{ fontSize: 10, color: STRENGTH_COLORS[score - 1] || '#7E7EA0', marginTop: 3, display: 'block' }}>
          {score > 0 ? STRENGTH_LABELS[score - 1] : ''}
        </span>
      )}
    </div>
  )
}

export default function Register() {
  const { signUp }   = useAuth()
  const { push }     = useToast()
  const navigate     = useNavigate()
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading]         = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', terms: false },
  })

  const password = useWatch({ control, name: 'password' })

  async function onSubmit(data) {
    setGlobalError('')
    setLoading(true)
    try {
      const user = await signUp(data.email, data.password, data.fullName)
      push('Account created! Set up your first project.', 'success')
      // Pass newUser via state so Onboarding can create the session
      navigate('/onboarding', { state: { userId: user.id, email: data.email, password: data.password } })
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8E8F0', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Create your archive
        </h2>
        <p style={{ fontSize: 13, color: '#7E7EA0' }}>
          Start preserving the ideas your team discards.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <Field label="Full name" error={errors.fullName?.message}>
          <Input
            register={register('fullName')}
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            error={errors.fullName}
          />
        </Field>

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
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password}
          />
          <PasswordStrengthMeter password={password} />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <PasswordInput
            register={register('confirmPassword')}
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </Field>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 12, color: '#A0A0CC' }}>
          <input
            type="checkbox"
            {...register('terms')}
            style={{ accentColor: '#5B4BFF', width: 14, height: 14, marginTop: 1 }}
          />
          <span>
            I agree to the{' '}
            <span style={{ color: '#7B6FFF' }}>Terms of Service</span> and{' '}
            <span style={{ color: '#7B6FFF' }}>Privacy Policy</span>
          </span>
        </label>
        {errors.terms && (
          <span style={{ fontSize: 11, color: '#E05555', marginTop: -8 }}>
            {errors.terms.message}
          </span>
        )}

        <GlobalError message={globalError} />

        <PrimaryButton loading={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </PrimaryButton>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#7E7EA0', marginTop: 4 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#7B6FFF', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
