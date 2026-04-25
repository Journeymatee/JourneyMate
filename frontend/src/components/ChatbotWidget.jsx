import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { streamChatWithAi } from '../services/aiService'

const QUICK_QUESTIONS = [
  'Plan a 3-day budget Goa trip from Delhi',
  'Best month to visit Manali and why?',
  'How should I compare budget vs luxury quickly?',
]

const STORAGE_KEY = 'jm_ai_chat_history_v1'
const MAX_HISTORY = 12

function detectSpeechLang(text) {
  return /[\u0900-\u097F]/.test(String(text || '')) ? 'hi-IN' : 'en-IN'
}

function getInitialMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {
    // Ignore malformed storage and use default welcome.
  }
  return [
    {
      id: 1,
      role: 'bot',
      text: "Hi, I'm your JourneyMate AI assistant. Ask me for trip plans, best seasons, budget ideas, or route strategy.",
    },
  ]
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(getInitialMessages)
  const [sending, setSending] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [activeModel, setActiveModel] = useState('AI')
  const [preferredInputLang, setPreferredInputLang] = useState('en-IN')
  const recognitionRef = useRef(null)

  const speechRecognitionSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  const speechSynthesisSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending])

  useEffect(() => {
    if (!speechRecognitionSupported) return undefined

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = preferredInputLang
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
      if (!transcript) return
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }

    recognitionRef.current = recognition

    return () => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [preferredInputLang, speechRecognitionSupported])

  const persistMessages = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-30)))
    } catch {
      // No-op if storage is blocked.
    }
  }

  const speakText = (text) => {
    if (!voiceEnabled || !speechSynthesisSupported || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = detectSpeechLang(text)
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  const toggleListening = () => {
    if (!speechRecognitionSupported || sending) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    try {
      recognitionRef.current?.start()
    } catch {
      // Prevent crash if microphone start is blocked.
      setListening(false)
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev
      if (!next && speechSynthesisSupported) window.speechSynthesis.cancel()
      return next
    })
  }

  const sendMessage = async (text) => {
    const userText = text.trim()
    if (!userText) return
    if (sending) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: userText,
    }

    const botMessageId = Date.now() + 1
    const draftBotMessage = {
      id: botMessageId,
      role: 'bot',
      text: '',
      followUps: [],
    }

    const withUser = [...messages, userMessage, draftBotMessage]
    setMessages(withUser)
    setPreferredInputLang(detectSpeechLang(userText))
    setInput('')
    setSending(true)

    try {
      const history = withUser
        .filter((m) => !(m.id === botMessageId && m.role === 'bot'))
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))
      let streamedText = ''

      const final = await streamChatWithAi(userText, history, {
        onMeta: (payload) => {
          setActiveModel(payload?.model || 'AI')
        },
        onToken: (chunk) => {
          streamedText += chunk
          setMessages((prev) =>
            prev.map((m) => (m.id === botMessageId ? { ...m, text: streamedText } : m))
          )
        },
        onDone: (payload) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    followUps: Array.isArray(payload?.followUps) ? payload.followUps.slice(0, 3) : [],
                  }
                : m
            )
          )
        },
      })

      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === botMessageId
            ? { ...m, text: m.text.trim() || 'I could not generate a response right now.' }
            : m
        )
        persistMessages(next)
        return next
      })
      setActiveModel(final?.model || 'AI')
      speakText(streamedText)
    } catch (error) {
      const msg = error?.message ||
        'AI service is currently unavailable. Please try again after backend restart/config.'
      setMessages((prev) => {
        const next = prev.map((m) => (m.id === botMessageId ? { ...m, text: msg, followUps: [] } : m))
        persistMessages(next)
        return next
      })
      speakText(msg)
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = () => {
    const seed = [
      {
        id: Date.now(),
        role: 'bot',
        text: 'Chat reset done. Ask me for your next trip plan.',
      },
    ]
    setMessages(seed)
    persistMessages(seed)
    if (speechSynthesisSupported) window.speechSynthesis.cancel()
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[70] w-[calc(100vw-2rem)] sm:w-96 rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white">
              <span className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <Bot size={16} className="text-green-300" />
              </span>
              <div>
                <p className="text-sm font-semibold">JourneyMate AI</p>
                <p className="text-[11px] text-slate-400">Travel planning assistant · {activeModel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                className="w-8 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                aria-label="Reset chat"
              >
                <RotateCcw size={14} className="mx-auto" />
              </button>
              <button
                type="button"
                onClick={toggleVoice}
                className="w-8 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                aria-label={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
                disabled={!speechSynthesisSupported}
              >
                {voiceEnabled ? (
                  <Volume2 size={14} className="mx-auto" />
                ) : (
                  <VolumeX size={14} className="mx-auto" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                aria-label="Close chatbot"
              >
                <X size={15} className="mx-auto" />
              </button>
            </div>
          </div>

          <div className="px-4 py-3 max-h-80 overflow-y-auto space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[88%] rounded-xl px-3 py-2 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-auto bg-green-500/20 text-green-100 border border-green-500/25'
                    : 'bg-white/5 text-slate-200 border border-white/10'
                }`}
              >
                <p>{msg.text}</p>
                {msg.role === 'bot' && Array.isArray(msg.followUps) && msg.followUps.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.followUps.map((item) => (
                      <button
                        key={`${msg.id}-${item}`}
                        type="button"
                        onClick={() => sendMessage(item)}
                        className="text-[10px] px-2 py-1 rounded-md border border-white/20 bg-white/5 text-slate-300 hover:text-white hover:border-white/30"
                        disabled={sending}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="inline-flex items-center gap-2 bg-white/5 text-slate-300 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm">
                <Loader2 size={14} className="animate-spin" />
                JourneyMate AI is thinking...
              </div>
            )}
          </div>

          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg border border-white/15 text-slate-300 hover:text-white hover:border-white/25 bg-white/5 transition-colors"
                  disabled={sending}
                >
                  {question}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={!speechRecognitionSupported || sending}
                className={`w-10 h-10 rounded-xl border transition-colors ${
                  listening
                    ? 'bg-red-500/20 border-red-400/40 text-red-300'
                    : 'bg-white/5 border-white/15 text-slate-300 hover:text-white hover:border-white/25'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
              >
                {listening ? <MicOff size={16} className="mx-auto" /> : <Mic size={16} className="mx-auto" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? 'Listening... speak now' : 'Ask about routes, budget, or timings...'}
                className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!canSend}
                className="w-10 h-10 rounded-xl bg-green-500 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-400 transition-colors"
                aria-label="Send message"
              >
                <Send size={16} className="mx-auto" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 sm:right-6 z-[70] inline-flex items-center gap-2 rounded-full border border-green-400/40 bg-slate-950/90 px-4 py-3 text-green-300 shadow-xl shadow-black/50 hover:bg-slate-900 transition-colors"
      >
        <MessageCircle size={18} />
        <span className="text-sm font-semibold">Chat with AI</span>
        <Sparkles size={14} className="text-amber-300" />
      </button>
    </>
  )
}
