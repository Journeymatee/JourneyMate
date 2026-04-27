import React, { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ThinkingIndicator from './ThinkingIndicator'
import EmptyState from './EmptyState'

const STICK_THRESHOLD = 80

export default function MessageList({ messages, sending, onPickFollowUp, onPickPrompt }) {
  const scrollerRef = useRef(null)
  const [stickyBottom, setStickyBottom] = useState(true)

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    if (stickyBottom) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, sending, stickyBottom])

  const handleScroll = () => {
    const node = scrollerRef.current
    if (!node) return
    const distanceFromBottom = node.scrollHeight - (node.scrollTop + node.clientHeight)
    setStickyBottom(distanceFromBottom < STICK_THRESHOLD)
  }

  const scrollToBottom = () => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
    setStickyBottom(true)
  }

  const onlyGreeting = messages.length === 1 && messages[0]?.role === 'bot' && !messages[0]?.text?.includes('?')

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="h-full space-y-3 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
        role="log"
        aria-live="polite"
      >
        {onlyGreeting && (
          <EmptyState onPick={onPickPrompt} disabled={sending} />
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            sending={sending}
            onPickFollowUp={onPickFollowUp}
          />
        ))}

        {sending && messages[messages.length - 1]?.role !== 'bot' && (
          <ThinkingIndicator />
        )}
      </div>

      {!stickyBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-900/90 text-slate-200 shadow-lg shadow-black/40 backdrop-blur transition-colors hover:border-emerald-400/40 hover:text-white"
          aria-label="Jump to latest message"
        >
          <ArrowDown size={14} />
        </button>
      )}
    </div>
  )
}
