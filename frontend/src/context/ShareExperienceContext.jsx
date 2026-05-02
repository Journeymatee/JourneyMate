import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ShareExperienceModal from '../components/ShareExperienceModal'

/**
 * Global "Share your experience" dialog.
 *
 * Why a context? The dialog needs to be triggerable from anywhere —
 * Navbar, Footer, Blog list, BlogPost detail, hero CTAs — without each
 * caller mounting its own modal or duplicating form state. The provider
 * mounts a single modal at the app root and exposes:
 *
 *   - open()         → show the dialog
 *   - close()        → hide the dialog
 *   - isOpen         → current visibility
 *   - subscribe(cb)  → listen for "experience created" events; returns
 *                      an unsubscribe function. The Blog page uses this
 *                      to refresh its community list without prop-drilling.
 */
const ShareExperienceContext = createContext(null)

export function ShareExperienceProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const listenersRef = useRef(new Set())

  const open  = useCallback(() => setIsOpen(true),  [])
  const close = useCallback(() => setIsOpen(false), [])

  const subscribe = useCallback((cb) => {
    if (typeof cb !== 'function') return () => {}
    listenersRef.current.add(cb)
    return () => listenersRef.current.delete(cb)
  }, [])

  const notify = useCallback((experience) => {
    // Snapshot the listener set so a callback that unsubscribes during
    // notification doesn't mutate the iterator we're walking.
    for (const cb of [...listenersRef.current]) {
      try {
        cb(experience)
      } catch {
        /* a flaky listener must never break the publish flow */
      }
    }
  }, [])

  const value = useMemo(
    () => ({ isOpen, open, close, subscribe }),
    [isOpen, open, close, subscribe],
  )

  return (
    <ShareExperienceContext.Provider value={value}>
      {children}
      <ShareExperienceModal isOpen={isOpen} onClose={close} onSuccess={notify} />
    </ShareExperienceContext.Provider>
  )
}

export function useShareExperience() {
  const ctx = useContext(ShareExperienceContext)
  if (!ctx) {
    throw new Error('useShareExperience must be used inside <ShareExperienceProvider>')
  }
  return ctx
}

/**
 * Convenience hook: subscribe to "experience created" notifications for
 * the lifetime of the calling component. The `callback` should be stable
 * (wrap with useCallback) or the subscription will re-register on every
 * render.
 */
export function useShareExperienceSubscription(callback) {
  const { subscribe } = useShareExperience()
  useEffect(() => subscribe(callback), [subscribe, callback])
}
