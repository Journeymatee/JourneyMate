import { useEffect, useRef, useState } from 'react'

const SUPPORTED =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

/**
 * Wraps the browser SpeechRecognition API with safe fallbacks.
 * Only one instance lives at a time; lang can be changed dynamically.
 */
export function useSpeechRecognition({ lang = 'en-IN', onTranscript, disabled = false } = {}) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    if (!SUPPORTED) return undefined

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result?.[0]?.transcript || '')
        .join(' ')
        .trim()
      if (transcript) onTranscriptRef.current?.(transcript)
    }

    recognitionRef.current = recognition
    return () => {
      try {
        recognitionRef.current?.stop()
      } catch {
        // already stopped
      }
      recognitionRef.current = null
    }
  }, [lang])

  const start = () => {
    if (!SUPPORTED || disabled || listening) return
    try {
      recognitionRef.current?.start()
    } catch {
      setListening(false)
    }
  }

  const stop = () => {
    try {
      recognitionRef.current?.stop()
    } catch {
      // ignore
    }
  }

  const toggle = () => {
    if (listening) stop()
    else start()
  }

  return { supported: SUPPORTED, listening, start, stop, toggle }
}
