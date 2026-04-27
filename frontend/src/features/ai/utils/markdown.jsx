import React from 'react'

const URL_RE = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/gi

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function applyInline(raw) {
  let html = escapeHtml(raw)
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-white/10 text-emerald-300 text-[0.85em]">$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
  html = html.replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em class="text-slate-200">$2</em>')
  html = html.replace(URL_RE, (m) => {
    const href = m.startsWith('http') ? m : `https://${m}`
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-emerald-300 underline decoration-emerald-400/40 hover:decoration-emerald-300">${m}</a>`
  })
  return html
}

/**
 * Lightweight markdown-ish renderer tuned for chat replies.
 * Supports: ## headings, - / * bullets, 1. ordered lists, **bold**, *italic*, `code`, links.
 * Returns a React node tree (no dangerouslySetInnerHTML at the line level — safer for streaming).
 */
export function renderRichText(text) {
  const source = String(text || '')
  if (!source.trim()) return null

  const lines = source.split(/\r?\n/)
  const blocks = []
  let buffer = []
  let listType = null

  const flushList = () => {
    if (!buffer.length) return
    const items = buffer.map((item, i) => (
      <li key={`li-${blocks.length}-${i}`} className="leading-relaxed">
        <span dangerouslySetInnerHTML={{ __html: applyInline(item) }} />
      </li>
    ))
    if (listType === 'ol') {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="list-decimal pl-5 space-y-1 my-1">
          {items}
        </ol>
      )
    } else {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1 my-1 marker:text-emerald-400/70">
          {items}
        </ul>
      )
    }
    buffer = []
    listType = null
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      blocks.push(<div key={`sp-${i}`} className="h-1" />)
      continue
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      flushList()
      const level = heading[1].length
      const cls =
        level === 1
          ? 'text-base font-semibold text-white mt-1'
          : level === 2
            ? 'text-sm font-semibold text-white mt-1'
            : 'text-sm font-semibold text-emerald-200 mt-1'
      blocks.push(
        <p key={`h-${i}`} className={cls}>
          <span dangerouslySetInnerHTML={{ __html: applyInline(heading[2]) }} />
        </p>
      )
      continue
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      if (listType && listType !== 'ul') flushList()
      listType = 'ul'
      buffer.push(bullet[1])
      continue
    }

    const numbered = trimmed.match(/^\d+\.\s+(.+)$/)
    if (numbered) {
      if (listType && listType !== 'ol') flushList()
      listType = 'ol'
      buffer.push(numbered[1])
      continue
    }

    flushList()
    blocks.push(
      <p key={`p-${i}`} className="leading-relaxed">
        <span dangerouslySetInnerHTML={{ __html: applyInline(trimmed) }} />
      </p>
    )
  }

  flushList()
  return blocks
}
