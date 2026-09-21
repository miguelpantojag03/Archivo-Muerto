import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Generic text/email input with label + inline error
export function Field({ label, error, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#C8C8E0', letterSpacing: '0.02em' }}>
        {label}
      </label>
      {children}
      {error && (
        <span
          role="alert"
          aria-live="polite"
          style={{ fontSize: 11, color: '#E05555', marginTop: 1 }}
        >
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 11, color: '#7E7EA0', marginTop: 1 }}>{hint}</span>
      )}
    </div>
  )
}

const inputBase = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  background: '#0F0F22',
  border: '1px solid #2A2A48',
  color: '#E8E8F0',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.15s',
}

export function Input({ register, error, ...props }) {
  return (
    <input
      {...register}
      {...props}
      aria-invalid={!!error}
      style={{
        ...inputBase,
        borderColor: error ? '#E05555' : '#2A2A48',
      }}
      onFocus={e => { e.target.style.borderColor = error ? '#E05555' : '#5B4BFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,75,255,0.15)' }}
      onBlur={e => { e.target.style.borderColor = error ? '#E05555' : '#2A2A48'; e.target.style.boxShadow = 'none' }}
    />
  )
}

export function PasswordInput({ register, error, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        {...register}
        {...props}
        type={show ? 'text' : 'password'}
        aria-invalid={!!error}
        style={{
          ...inputBase,
          paddingRight: 40,
          borderColor: error ? '#E05555' : '#2A2A48',
        }}
        onFocus={e => { e.target.style.borderColor = error ? '#E05555' : '#5B4BFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,75,255,0.15)' }}
        onBlur={e => { e.target.style.borderColor = error ? '#E05555' : '#2A2A48'; e.target.style.boxShadow = 'none' }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#7E7EA0', padding: 2,
        }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export function PrimaryButton({ loading, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      {...props}
      style={{
        width: '100%',
        padding: '10px 0',
        borderRadius: 8,
        background: loading ? '#3A2ECC' : '#5B4BFF',
        color: 'white',
        fontWeight: 600,
        fontSize: 14,
        fontFamily: 'inherit',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4A3AEE' }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#5B4BFF' }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export function GlobalError({ message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        padding: '8px 12px',
        borderRadius: 7,
        background: 'rgba(224,85,85,0.1)',
        border: '1px solid rgba(224,85,85,0.3)',
        color: '#E05555',
        fontSize: 12,
        marginBottom: 4,
      }}
    >
      {message}
    </div>
  )
}

export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: '#2A2A48' }} />
      <span style={{ fontSize: 11, color: '#7E7EA0' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#2A2A48' }} />
    </div>
  )
}

export function Spinner() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      style={{ animation: 'am-spin 0.75s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes am-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}
