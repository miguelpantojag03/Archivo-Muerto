import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import { Field, Input, PrimaryButton, GlobalError } from '../components/FormField.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useToast } from '../components/Toast.jsx'
import { onboardingSchema } from '../lib/validators.js'

export default function Onboarding() {
  // Register now signs in BEFORE navigating here, so user is authenticated.
  // We only need userId to setActiveProject — no password needed.
  const { user, setActiveProject } = useAuth()
  const { push }                   = useToast()
  const navigate                   = useNavigate()
  const location                   = useLocation()

  // userId from state (fallback to user from context for resilience)
  const userId = location.state?.userId ?? user?.id

  const [loading, setLoading]         = useState(false)
  const [globalError, setGlobalError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { projectName: 'Nebula System' },
  })

  async function onSubmit(data) {
    setGlobalError('')
    setLoading(true)
    try {
      await setActiveProject(data.projectName)
      push('Welcome! Your archive is ready.', 'success')
      navigate('/app', { replace: true })
    } catch (err) {
      setGlobalError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(91,75,255,0.15)', border: '1px solid rgba(91,75,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={26} style={{ color: '#7B6FFF' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8E8F0', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Name your first project
          </h2>
          <p style={{ fontSize: 13, color: '#7E7EA0', lineHeight: 1.6 }}>
            Every great archive starts with a project. You can add more later.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          <Field label="Project name" error={errors.projectName?.message}>
            <Input register={register('projectName')} type="text"
              placeholder="e.g. Nebula System" autoComplete="off" error={errors.projectName} />
          </Field>

          <GlobalError message={globalError} />

          <PrimaryButton loading={loading}>
            {loading ? 'Setting up…' : 'Start Archiving →'}
          </PrimaryButton>
        </form>
      </div>
    </AuthLayout>
  )
}
