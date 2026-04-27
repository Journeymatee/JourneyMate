import { useCallback, useEffect, useState } from 'react'
import { detectSpeechLang } from '../utils/language'

const SUPPORTED =
  typeof window !== 'undefined' && 'speechSynthesis' in window

export function useTextToSpeech({ initialEnabled = true } = {}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [speaking, setSpeaking] = useState(false)

  const cancel = useCallback(() => {
    if (!SUPPORTED) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  useEffect(() => () => cancel(), [cancel])

  const speak = useCallback(
    (text) => {
      if (!enabled || !SUPPORTED) return
      const trimmed = String(text || '').trim()
      if (!trimmed) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(trimmed)
      utterance.lang = detectSpeechLang(trimmed)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [enabled]
  )

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      if (!next) cancel()
      return next
    })
  }, [cancel])

  return { supported: SUPPORTED, enabled, speaking, speak, cancel, toggle }
}
