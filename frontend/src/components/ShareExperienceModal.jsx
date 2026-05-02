import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarDays,
  PenLine,
  User as UserIcon,
} from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

/* ── Form constraints — kept in sync with backend express-validator rules.
 *    See backend/src/modules/blog/blog.experiencesList.routes.js. */
const LIMITS = Object.freeze({
  display_name: { min: 2,  max: 120 },
  title:        { min: 4,  max: 200 },
  body:         { min: 20, max: 5000 },
  destination:  { min: 0,  max: 120 },
  visit_months: { min: 0,  max: 200 },
})

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/* ── Form state machine ──────────────────────────────────────────
 * useReducer keeps the form contained (one `dispatch` instead of 7
 * setState calls), and gives the close/success transitions a single
 * authoritative source of truth. */

const INITIAL_VALUES = {
  display_name: '',
  title: '',
  body: '',
  destination: '',
  visit_months: '',
}

const initialState = {
  values: INITIAL_VALUES,
  status: 'idle', // 'idle' | 'submitting' | 'success'
  error: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'set_field':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        // Typing always clears prior errors so they don't linger.
        error: '',
      }
    case 'reset':
      return {
        ...initialState,
        values: { ...INITIAL_VALUES, display_name: action.displayName || '' },
      }
    case 'submit':
      return { ...state, status: 'submitting', error: '' }
    case 'success':
      return { ...state, status: 'success', error: '' }
    case 'error':
      return { ...state, status: 'idle', error: action.error || 'Something went wrong.' }
    default:
      return state
  }
}

/* ── Custom hooks ─────────────────────────────────────────────── */

function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

function useEscapeToClose(active, onClose) {
  useEffect(() => {
    if (!active) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onClose])
}

/**
 * Trap Tab focus inside the dialog while it's open and restore focus to
 * the previously focused element when it closes. This is the boring but
 * essential a11y wiring most modals skip.
 */
function useFocusTrap(rootRef, active, initialFocusRef) {
  useEffect(() => {
    if (!active) return undefined
    const root = rootRef.current
    if (!root) return undefined
    const previouslyFocused = document.activeElement

    // Defer focus to next frame so the open animation has started and
    // mobile keyboards don't pop before the panel is on-screen.
    const t = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ||
        root.querySelector(FOCUSABLE_SELECTOR) ||
        root
      if (target && typeof target.focus === 'function') target.focus()
    }, 50)

    function onKey(e) {
      if (e.key !== 'Tab') return
      const list = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null && !el.hasAttribute('disabled'),
      )
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey && activeEl === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      }
    }
    root.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(t)
      root.removeEventListener('keydown', onKey)
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus()
        } catch {
          /* element may have unmounted */
        }
      }
    }
  }, [active, rootRef, initialFocusRef])
}

/**
 * Two-phase mount/animate for smooth open AND close transitions:
 *   - On open  → mount immediately, flip `entered` on the next frame so
 *               the "from" classes paint first and the transition runs.
 *   - On close → flip `entered` to false (close animation plays), then
 *               unmount after `duration` ms.
 */
function useEntranceState(isOpen, duration = 220) {
  const [mounted, setMounted] = useState(isOpen)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    let raf = 0
    let timeout = 0
    if (isOpen) {
      setMounted(true)
      raf = window.requestAnimationFrame(() => setEntered(true))
    } else {
      setEntered(false)
      if (mounted) {
        timeout = window.setTimeout(() => setMounted(false), duration)
      }
    }
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      if (timeout) window.clearTimeout(timeout)
    }
  }, [isOpen, mounted, duration])

  return { mounted, entered }
}

/* ── Validation ──────────────────────────────────────────────── */

function fieldError(name, value) {
  const v = (value ?? '').trim()
  const lim = LIMITS[name]
  if (!lim) return ''
  if (lim.min > 0 && v.length === 0) return 'Required'
  if (v.length > 0 && v.length < lim.min) return `At least ${lim.min} characters`
  if (v.length > lim.max) return `Max ${lim.max} characters`
  return ''
}

function isFormValid(values) {
  return (
    !fieldError('display_name', values.display_name) &&
    !fieldError('title', values.title) &&
    !fieldError('body', values.body) &&
    !fieldError('destination', values.destination) &&
    !fieldError('visit_months', values.visit_months)
  )
}

/* ── UI atoms ─────────────────────────────────────────────────── */

function Counter({ value, max }) {
  const len = (value ?? '').length
  const pct = Math.min(100, (len / max) * 100)
  const tone =
    pct < 70 ? 'text-slate-500' : pct < 95 ? 'text-amber-300' : 'text-rose-300'
  return (
    <span className={`text-[10px] tabular-nums ${tone}`}>
      {len}/{max}
    </span>
  )
}

function Field({
  id,
  label,
  icon: Icon,
  children,
  hint,
  error,
  optional = false,
  trailing,
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label htmlFor={id} className="text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5">
          {Icon && <Icon size={13} className="text-slate-400" />}
          {label}
          {optional && <span className="text-[10px] font-normal text-slate-500">(optional)</span>}
        </label>
        {trailing}
      </div>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-rose-300 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

/* ── The modal ─────────────────────────────────────────────────── */

export default function ShareExperienceModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  // Auto-prefill the display name from the signed-in user. Re-runs when
  // the modal is reopened so a re-login picks up the new name.
  useEffect(() => {
    if (!isOpen) return
    dispatch({ type: 'reset', displayName: user?.name || '' })
  }, [isOpen, user?.name])

  const titleId    = useId()
  const fmTitleId  = useId()
  const fmNameId   = useId()
  const fmDestId   = useId()
  const fmMonthsId = useId()
  const fmBodyId   = useId()

  const rootRef = useRef(null)
  const initialFocusRef = useRef(null)

  const { mounted, entered } = useEntranceState(isOpen, 220)
  useBodyScrollLock(isOpen)
  useEscapeToClose(isOpen && state.status !== 'submitting', onClose)
  useFocusTrap(rootRef, isOpen, initialFocusRef)

  const valid = useMemo(() => isFormValid(state.values), [state.values])

  const setField = useCallback(
    (field) => (e) => dispatch({ type: 'set_field', field, value: e.target.value }),
    [],
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!valid || state.status === 'submitting') return
      dispatch({ type: 'submit' })
      try {
        const v = state.values
        const payload = {
          title: v.title.trim(),
          display_name: v.display_name.trim(),
          body: v.body.trim(),
        }
        if (v.destination.trim())  payload.destination  = v.destination.trim()
        if (v.visit_months.trim()) payload.visit_months = v.visit_months.trim()

        const { data } = await api.post('/blog/experiences', payload)
        dispatch({ type: 'success' })
        if (typeof onSuccess === 'function') {
          try {
            onSuccess(data?.experience || null)
          } catch {
            /* listener errors must never break the modal close */
          }
        }
        // Stay on the success screen for a beat, then close.
        window.setTimeout(() => {
          onClose()
        }, 1400)
      } catch (err) {
        const d = err?.response?.data
        const msg =
          d?.error?.message ||
          (Array.isArray(d?.error?.details) && d.error.details[0]?.msg) ||
          err?.message ||
          'Could not save your experience. Try again in a moment.'
        dispatch({ type: 'error', error: msg })
      }
    },
    [valid, state.status, state.values, onSuccess, onClose],
  )

  if (!mounted) return null

  const isSubmitting = state.status === 'submitting'
  const isSuccess = state.status === 'success'

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-200 ease-out ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop — close on click unless mid-submit */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => {
          if (!isSubmitting) onClose()
        }}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
      />

      {/* Centering wrapper (desktop) / bottom-sheet wrapper (mobile) */}
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6 outline-none"
        tabIndex={-1}
      >
        {/* The card */}
        <div
          className={`relative w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transform transition-all duration-200 ease-out ${
            entered
              ? 'opacity-100 translate-y-0 sm:scale-100'
              : 'opacity-0 translate-y-6 sm:translate-y-3 sm:scale-[0.97]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile sheet affordance) */}
          <div className="sm:hidden flex justify-center pt-2.5 pb-1">
            <div className="w-10 h-1.5 rounded-full bg-white/15" />
          </div>

          {/* Decorative ambient glow */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

          {/* Header */}
          <div className="relative flex items-start justify-between gap-4 px-5 sm:px-7 pt-4 sm:pt-6 pb-4 border-b border-white/8">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/25 to-rose-500/15 border border-amber-400/30 shrink-0">
                <Sparkles size={20} className="text-amber-200" />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="font-display font-bold text-lg sm:text-xl text-white leading-tight">
                  Share your travel story
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                  Honest field notes help the next traveller pick the right month, route, and budget.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
              className="w-9 h-9 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          {isSuccess ? (
            <SuccessPanel />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="relative flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6 space-y-5"
              noValidate
            >
              {/* Top error banner */}
              {state.error && (
                <div
                  className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100 flex items-start gap-2"
                  role="alert"
                >
                  <AlertCircle size={16} className="text-rose-300 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Row 1: title + name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  id={fmTitleId}
                  label="Story title"
                  icon={PenLine}
                  trailing={<Counter value={state.values.title} max={LIMITS.title.max} />}
                  error={state.values.title.length > 0 ? fieldError('title', state.values.title) : ''}
                  hint="A short headline — what would you tell a friend?"
                >
                  <input
                    ref={initialFocusRef}
                    id={fmTitleId}
                    type="text"
                    value={state.values.title}
                    onChange={setField('title')}
                    placeholder="e.g. A monsoon morning in Munnar"
                    maxLength={LIMITS.title.max}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-60"
                  />
                </Field>

                <Field
                  id={fmNameId}
                  label="Your name"
                  icon={UserIcon}
                  trailing={<Counter value={state.values.display_name} max={LIMITS.display_name.max} />}
                  error={
                    state.values.display_name.length > 0
                      ? fieldError('display_name', state.values.display_name)
                      : ''
                  }
                  hint={user ? 'Shown publicly with your story' : 'Shown publicly — first name is fine'}
                >
                  <input
                    id={fmNameId}
                    type="text"
                    value={state.values.display_name}
                    onChange={setField('display_name')}
                    placeholder="Your display name"
                    maxLength={LIMITS.display_name.max}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-60"
                  />
                </Field>
              </div>

              {/* Row 2: destination + visit months */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  id={fmDestId}
                  label="Destination"
                  icon={MapPin}
                  optional
                  trailing={<Counter value={state.values.destination} max={LIMITS.destination.max} />}
                  hint="City or region you're writing about"
                >
                  <input
                    id={fmDestId}
                    type="text"
                    value={state.values.destination}
                    onChange={setField('destination')}
                    placeholder="e.g. Hampi"
                    maxLength={LIMITS.destination.max}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-60"
                  />
                </Field>

                <Field
                  id={fmMonthsId}
                  label="Best time to visit"
                  icon={CalendarDays}
                  optional
                  trailing={<Counter value={state.values.visit_months} max={LIMITS.visit_months.max} />}
                  hint="When would you go again? (or skip)"
                >
                  <input
                    id={fmMonthsId}
                    type="text"
                    value={state.values.visit_months}
                    onChange={setField('visit_months')}
                    placeholder="e.g. November–February"
                    maxLength={LIMITS.visit_months.max}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-60"
                  />
                </Field>
              </div>

              {/* Body */}
              <Field
                id={fmBodyId}
                label="Your story"
                icon={PenLine}
                trailing={<Counter value={state.values.body} max={LIMITS.body.max} />}
                error={state.values.body.length > 0 ? fieldError('body', state.values.body) : ''}
                hint="Field notes the next traveller will thank you for. You can paste image links as ![alt](https://…) and they'll appear in your post."
              >
                <textarea
                  id={fmBodyId}
                  value={state.values.body}
                  onChange={setField('body')}
                  rows={7}
                  placeholder="What surprised you, what you'd do again, where to actually eat, what to skip — at least 20 characters."
                  maxLength={LIMITS.body.max}
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all leading-relaxed resize-y min-h-[140px] disabled:opacity-60"
                />
              </Field>
            </form>
          )}

          {/* Footer (only when form is showing) */}
          {!isSuccess && (
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 sm:px-7 py-3.5 bg-slate-950/40">
              <p className="text-[11px] text-slate-500">
                We'll publish to the public community feed for new members.
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => !isSubmitting && onClose()}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!valid || isSubmitting}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                    !valid || isSubmitting
                      ? 'bg-cyan-500/30 text-cyan-100/60 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 hover:-translate-y-px'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Publish story
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SuccessPanel() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-12 sm:py-16">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center animate-scale-in">
          <CheckCircle2 size={36} className="text-emerald-300" />
        </div>
        <div className="absolute -inset-3 rounded-full bg-emerald-400/15 blur-2xl -z-10" />
      </div>
      <h3 className="font-display font-bold text-xl text-white mb-2">
        Thanks — your story is live
      </h3>
      <p className="text-sm text-slate-400 max-w-sm">
        Other travellers can now like, react and comment on your note. Closing in a moment…
      </p>
    </div>
  )
}
