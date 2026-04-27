import React, { useEffect, useRef } from 'react'
import { Mic, MicOff, Send, Square } from 'lucide-react'

const MAX_HEIGHT = 160

export default function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  sending,
  listening,
  speechSupported,
  onToggleListening,
}) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (sending) return
      if (value.trim()) onSubmit?.()
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (sending) {
      onStop?.()
      return
    }
    if (value.trim()) onSubmit?.()
  }

  const canSend = value.trim().length > 0
  const placeholder = listening
    ? 'Listening — speak now…'
    : 'Ask about itineraries, routes, budgets…  (Shift+Enter for newline)'

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-white/10 bg-slate-950/80 p-2.5 sm:p-3"
    >
      <button
        type="button"
        onClick={onToggleListening}
        disabled={!speechSupported || sending}
        aria-label={listening ? 'Stop voice input' : 'Start voice input'}
        title={
          speechSupported
            ? listening
              ? 'Stop voice input'
              : 'Voice input'
            : 'Voice input is not supported in this browser'
        }
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
          listening
            ? 'border-rose-400/40 bg-rose-500/20 text-rose-200 animate-pulse'
            : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {listening ? <MicOff size={16} /> : <Mic size={16} />}
      </button>

      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          disabled={sending && !value}
          className="block max-h-40 w-full resize-none rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      <button
        type="submit"
        disabled={!sending && !canSend}
        aria-label={sending ? 'Stop generating' : 'Send message'}
        title={sending ? 'Stop generating' : 'Send (Enter)'}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          sending
            ? 'bg-rose-500 text-white hover:bg-rose-400'
            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {sending ? <Square size={14} /> : <Send size={16} />}
      </button>
    </form>
  )
}
