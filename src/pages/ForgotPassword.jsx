import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import { Field, Input, PrimaryButton, GlobalError } from '../components/FormField.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { forgotSchema } from '../lib/validators.js'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data) {
    setGlobalError('')
    setLoading(true)
    try {
      await resetPassword(data.email)
      setSent(true)
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 0' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={26} style={{ color: '#4ADE80' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#E8E8F0', marginBottom: 8 }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: 13, color: '#7E7EA0', lineHeight: 1.6 }}>
              If <strong style={{ color: '#C8C8E0' }}>{getValues('email')}</strong> is registered,
              we've sent a reset link. Check your spam folder too.
            </p>
          </div>
          <Link
            to="/login"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: '#7B6FFF', textDecoration: 'none', marginTop: 8,
            }}
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8E8F0', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Reset your password
            </h2>
            <p style={{ fontSize: 13, color: '#7E7EA0' }}>
              Enter your email and we'll send a reset link.
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

            <GlobalError message={globalError} />

            <PrimaryButton loading={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </PrimaryButton>

            <Link
              to="/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 12, color: '#7E7EA0', textDecoration: 'none', marginTop: 4,
              }}
            >
              <ArrowLeft size={13} /> Back to sign in
            </Link>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
