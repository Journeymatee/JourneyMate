import React, { useState } from 'react'
import { Bot, Check, Copy, User, Wifi } from 'lucide-react'
import { renderRichText } from '../utils/markdown'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return
    try {
      await navigator.clipboard?.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore — likely permission denied
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300 transition-colors hover:border-white/20 hover:text-white"
      aria-label="Copy message"
    >
      {copied ? <Check size={11} className="text-emerald-300" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function MessageBubble({ message, onPickFollowUp, sending }) {
  const isUser = message.role === 'user'
  const isStreaming = !!message.streaming

  const hasFollowUps =
    !isUser && Array.isArray(message.followUps) && message.followUps.length > 0

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
          isUser
            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
            : 'border-white/15 bg-slate-900/80 text-emerald-300'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      <div className={`flex max-w-[85%] flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative rounded-2xl border px-3 py-2 text-xs leading-relaxed shadow-sm sm:text-sm ${
            isUser
              ? 'rounded-tr-sm border-emerald-400/30 bg-emerald-500/15 text-emerald-50'
              : message.error
                ? 'rounded-tl-sm border-rose-400/30 bg-rose-500/10 text-rose-100'
                : 'rounded-tl-sm border-white/10 bg-white/5 text-slate-100'
          }`}
        >
          <div className="space-y-1.5 break-words [overflow-wrap:anywhere]">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <>
                {renderRichText(message.text)}
                {isStreaming && (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-emerald-300/80 align-baseline" />
                )}
              </>
            )}
          </div>

          {!isUser && message.liveHint && !isStreaming && (
            <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-300/90">
              <Wifi size={10} />
              {message.liveHint}
            </p>
          )}
        </div>

        {!isUser && !isStreaming && message.text && !message.error && (
          <CopyButton text={message.text} />
        )}

        {hasFollowUps && !isStreaming && (
          <div className="flex flex-wrap gap-1.5">
            {message.followUps.map((item) => (
              <button
                key={`${message.id}-${item}`}
                type="button"
                onClick={() => onPickFollowUp?.(item)}
                disabled={sending}
                className="rounded-full border border-emerald-400/30 bg-emerald-500/5 px-2.5 py-1 text-[10px] text-emerald-200 transition-colors hover:border-emerald-300/60 hover:bg-emerald-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
