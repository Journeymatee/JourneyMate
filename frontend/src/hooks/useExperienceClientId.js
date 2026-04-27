import { useEffect, useState } from 'react'

const KEY = 'jm_exp_cid'

/**
 * Stable anonymous id for public likes, reactions, and guest comments.
 */
export function useExperienceClientId() {
  const [clientId, setClientId] = useState('')

  useEffect(() => {
    try {
      let v = localStorage.getItem(KEY)
      if (!v || v.length < 8) {
        v = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `g-${Date.now()}-${Math.random().toString(36).slice(2)}`
        if (v.length < 8) v = `${v}xxxxxxxx`
        v = v.slice(0, 64)
        localStorage.setItem(KEY, v)
      }
      setClientId(v)
    } catch {
      setClientId('')
    }
  }, [])

  return clientId
}
