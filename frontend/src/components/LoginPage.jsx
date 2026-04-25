import React, { useState, useEffect, useCallback } from 'react'
import { Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_CONFIGURED = Boolean(GOOGLE_CLIENT_ID)

/* ── Load Google Identity Services script once ─────────────── */
function loadGIS() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

export default function LoginPage() {
  const { login, register, loginWithGoogle, forgotPassword } = useAuth()
  const [mode, setMode]           = useState('login')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [name, setName]           = useState('')
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetting, setResetting] = useState(false)

  /* Initialise Google GIS button */
  useEffect(() => {
    if (!GOOGLE_CONFIGURED) return
    loadGIS().then(() => {
      if (!window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      setGoogleReady(true)
    })
  }, [])

  /* Render the official Google button after GIS is ready */
  useEffect(() => {
    if (!googleReady) return
    const el = document.getElementById('google-signin-btn')
    if (!el) return
    window.google.accounts.id.renderButton(el, {
      theme: 'filled_black',
      size: 'large',
      width: el.offsetWidth || 360,
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    })
  }, [googleReady, mode])

  const handleGoogleCredential = useCallback(async ({ credential }) => {
    setError('')
    setSubmitting(true)
    try {
      await loginWithGoogle(credential)
    } catch (err) {
      const api = err.response?.data?.error
      setError(
        (api && typeof api === 'object' && api.message) ||
        (typeof api === 'string' && api) ||
        err.message ||
        'Google Sign-In failed. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }, [loginWithGoogle])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register({ email: email.trim(), password, name: name.trim() || 'Traveler' })
      }
    } catch (err) {
      const api = err.response?.data?.error
      let msg =
        (api && typeof api === 'object' && api.message) ||
        (typeof api === 'string' && api) ||
        err.message ||
        'Something went wrong. Is the API running?'
      const details = api?.details
      if (Array.isArray(details) && details.length) {
        msg += ' — ' + details.map((d) => `${d.field}: ${d.msg}`).join(', ')
      }
      setError(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const openForgot = () => {
    setShowForgot(true)
    setResetEmail(email)
    setResetPassword('')
    setResetConfirm('')
    setResetError('')
    setResetMsg('')
  }

  const closeForgot = () => {
    setShowForgot(false)
    setResetError('')
    setResetMsg('')
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetMsg('')

    const cleanEmail = resetEmail.trim().toLowerCase()
    if (!cleanEmail) return setResetError('Please enter your email.')
    if (resetPassword.length < 6) return setResetError('Password must be at least 6 characters.')
    if (resetPassword !== resetConfirm) return setResetError('Passwords do not match.')

    setResetting(true)
    try {
      const data = await forgotPassword(cleanEmail, resetPassword)
      setEmail(cleanEmail)
      setPassword('')
      setResetMsg(data?.message || 'Password updated. You can sign in now.')
      setMode('login')
    } catch (err) {
      const api = err.response?.data?.error
      setResetError(
        (api && typeof api === 'object' && api.message) ||
        (typeof api === 'string' && api) ||
        err.message ||
        'Could not reset password. Please try again.'
      )
    } finally {
      setResetting(false)
    }
  }

  return (
    <div
      className="relative min-h-[100dvh] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 py-16 safe-pad"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-950/72" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/25 via-slate-950/40 to-amber-900/20" aria-hidden />
      <div className="w-full max-w-md relative z-10">

        {/* Logo + heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[11px] text-slate-300 font-medium tracking-wide">Secure access to JourneyMate</span>
          </div>
          <div className="mb-4 relative">
            <img
              src="/logo.svg"
              alt="JourneyMate"
              className="w-16 h-16 rounded-2xl shadow-2xl shadow-green-500/30"
            />
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-green-500/20 to-amber-500/20 blur-md -z-10" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
            JourneyMate
          </h1>
          <p className="text-slate-300/95 text-sm sm:text-base mt-2 max-w-xs mx-auto leading-relaxed">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your free account and start exploring.'}
          </p>
        </div>

        <div className="glass rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl shadow-black/40">

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-slate-900/50 border border-white/10 p-1 mb-6">
            {[['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Google Sign-In ── */}
          {GOOGLE_CONFIGURED ? (
            <div className="mb-5">
              {/* Official Google button rendered by GIS */}
              <div
                id="google-signin-btn"
                className="w-full overflow-hidden rounded-xl"
                style={{ minHeight: 44 }}
              />
              {!googleReady && (
                <div className="h-11 rounded-xl bg-slate-900/55 border border-white/12 flex items-center justify-center gap-2 text-slate-300 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Loading Google…
                </div>
              )}
            </div>
          ) : (
            /* Show a grayed-out button when not configured */
            <div className="mb-5 group relative">
              <button
                type="button"
                disabled
                title="Set VITE_GOOGLE_CLIENT_ID in frontend/.env.local to enable"
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-slate-900/55 border border-white/12 text-slate-400 font-semibold text-sm cursor-not-allowed select-none"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-slate-600 ml-1">Not configured</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                Add <code className="text-slate-300">VITE_GOOGLE_CLIENT_ID</code> to enable
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {showForgot && (
            <div className="mb-5 rounded-2xl border border-white/12 bg-slate-900/60 p-4">
              <p className="text-sm font-semibold text-white mb-3">Reset password</p>
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  className="w-full rounded-xl bg-slate-900/70 border border-white/12 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/45 focus:ring-2 focus:ring-green-500/20 placeholder:text-slate-400"
                  type="email"
                  placeholder="Your account email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <input
                  className="w-full rounded-xl bg-slate-900/70 border border-white/12 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/45 focus:ring-2 focus:ring-green-500/20 placeholder:text-slate-400"
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <input
                  className="w-full rounded-xl bg-slate-900/70 border border-white/12 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/45 focus:ring-2 focus:ring-green-500/20 placeholder:text-slate-400"
                  type="password"
                  placeholder="Confirm new password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />

                {resetError && (
                  <p className="text-xs text-red-300">{resetError}</p>
                )}
                {resetMsg && (
                  <p className="text-xs text-emerald-300">{resetMsg}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={resetting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {resetting ? 'Updating...' : 'Update password'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForgot}
                    className="px-4 py-2.5 rounded-xl border border-white/12 text-slate-300 hover:text-white hover:border-white/20 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <label className="block">
                <span className="text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider">Name</span>
                <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-slate-900/55 hover:bg-white/[0.07] border border-white/12 px-4 py-3 focus-within:border-green-500/45 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                  <User size={16} className="text-slate-400 shrink-0" />
                  <input
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-400"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider">Email</span>
              <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-slate-900/55 hover:bg-white/[0.07] border border-white/12 px-4 py-3 focus-within:border-green-500/45 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <input
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-400"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider">Password</span>
              <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-slate-900/55 hover:bg-white/[0.07] border border-white/12 px-4 py-3 focus-within:border-green-500/45 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-400"
                  type="password"
                  required
                  minLength={mode === 'register' ? 6 : 1}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={openForgot}
                  className="text-xs text-slate-300 hover:text-green-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </label>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-green-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {submitting ? (
                <><Loader2 className="animate-spin" size={16} /> Please wait…</>
              ) : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
