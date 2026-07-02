import { useCallback, useEffect, useRef, useState } from 'react'
import { streamChatWithAi } from '../services/aiService'
import { detectSpeechLang, getRealtimeHint } from '../utils/language'
import { buildResetGreeting, loadMessages, persistMessages } from '../utils/persistence'

const MAX_HISTORY_FOR_API = 12

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useChatStream({ onSpeak } = {}) {
  const [messages, setMessages] = useState(loadMessages)
  const [sending, setSending] = useState(false)
  const [activeModel, setActiveModel] = useState('AI')
  const [inputLang, setInputLang] = useState('en-IN')
  const abortRef = useRef(null)
  const planRef = useRef(null)

  const onSpeakRef = useRef(onSpeak)
  useEffect(() => {
    onSpeakRef.current = onSpeak
  }, [onSpeak])

  const persist = useCallback((next) => {
    persistMessages(next)
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setSending(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    const seed = [buildResetGreeting()]
    setMessages(seed)
    persist(seed)
    planRef.current = null
  }, [persist, stop])

  const send = useCallback(
    async (text) => {
      const userText = String(text || '').trim()
      if (!userText || sending) return

      const userMessageId = makeId()
      const botMessageId = makeId()

      const userMessage = { id: userMessageId, role: 'user', text: userText }
      const draftBotMessage = {
        id: botMessageId,
        role: 'bot',
        text: '',
        followUps: [],
        liveHint: '',
        streaming: true,
      }

      let nextMessages = []
      setMessages((prev) => {
        nextMessages = [...prev, userMessage, draftBotMessage]
        return nextMessages
      })
      setInputLang(detectSpeechLang(userText))
      setSending(true)

      const controller = new AbortController()
      abortRef.current = controller

      const history = nextMessages
        .filter((m) => m.id !== botMessageId)
        .slice(-MAX_HISTORY_FOR_API)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))

      let streamedText = ''
      let liveHint = ''
      let nextPlan = null

      try {
        const final = await streamChatWithAi(userText, history, planRef.current, {
          signal: controller.signal,
          onMeta: (payload) => {
            setActiveModel(payload?.model || 'AI')
            liveHint = getRealtimeHint(payload?.realtime)
          },
          onToken: (chunk) => {
            streamedText += chunk
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMessageId ? { ...m, text: streamedText } : m
              )
            )
          },
          onDone: (payload) => {
            nextPlan = payload?.plan || null
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMessageId
                  ? {
                      ...m,
                      followUps: Array.isArray(payload?.followUps)
                        ? payload.followUps.slice(0, 3)
                        : [],
                      liveHint,
                      plan: payload?.plan || null,
                    }
                  : m
              )
            )
          },
        })

        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === botMessageId
              ? {
                  ...m,
                  text: m.text.trim() || 'I could not generate a response right now.',
                  liveHint: m.liveHint || getRealtimeHint(final?.realtime),
                  streaming: false,
                  plan: m.plan || final?.plan || null,
                }
              : m
          )
          persist(next)
          return next
        })

        planRef.current = nextPlan || final?.plan || planRef.current
        setActiveModel(final?.model || 'AI')
        if (streamedText) onSpeakRef.current?.(streamedText)
      } catch (err) {
        const aborted = err?.name === 'AbortError'
        const partial = streamedText.trim()

        setMessages((prev) => {
          const next = prev.map((m) => {
            if (m.id !== botMessageId) return m
            if (aborted) {
              return {
                ...m,
                text: partial || '_(response stopped)_',
                streaming: false,
                followUps: [],
              }
            }
            const friendly =
              err?.status === 401
                ? 'Please sign in again to chat — your session has expired.'
                : err?.message ||
                  'AI service is currently unavailable. Please try again in a moment.'
            return {
              ...m,
              text: friendly,
              streaming: false,
              followUps: [],
              liveHint: '',
              error: true,
            }
          })
          persist(next)
          return next
        })
      } finally {
        abortRef.current = null
        setSending(false)
      }
    },
    [persist, sending]
  )

  return {
    messages,
    sending,
    activeModel,
    inputLang,
    send,
    stop,
    reset,
  }
}
