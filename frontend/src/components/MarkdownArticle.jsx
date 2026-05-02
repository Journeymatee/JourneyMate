import React, { useMemo } from 'react'

/**
 * Tiny opinionated Markdown renderer for blog article bodies.
 *
 * Supported block elements:
 *   - Headings (## H2, ### H3, #### H4)
 *   - Paragraphs (blank-line separated)
 *   - Unordered lists (`- item`)
 *   - Ordered lists (`1. item`)
 *   - Blockquotes (`> quote`)
 *   - Pipe tables (`| col | col |` with `|---|---|` separator row)
 *   - Horizontal rules (`---`)
 *
 * Supported inline elements:
 *   - **bold**, *italic*, `code`, [text](url)
 *
 * Designed for trusted content seeded by us. We still escape stray `<`
 * `>` `&` so a copy-paste of HTML doesn't render as DOM, but this is
 * NOT a sanitiser for arbitrary user HTML.
 */

const HEADING_RE = /^(#{1,4})\s+(.*)$/
const UL_RE      = /^[-*]\s+(.*)$/
const OL_RE      = /^(\d+)\.\s+(.*)$/
const QUOTE_RE   = /^>\s?(.*)$/
const TABLE_RE   = /^\|(.+)\|\s*$/
const HR_RE      = /^-{3,}$/

function parseBlocks(raw) {
  const lines = String(raw || '').replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i += 1
      continue
    }

    if (HR_RE.test(line.trim())) {
      blocks.push({ type: 'hr' })
      i += 1
      continue
    }

    const heading = line.match(HEADING_RE)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      i += 1
      continue
    }

    if (UL_RE.test(line)) {
      const items = []
      while (i < lines.length && UL_RE.test(lines[i])) {
        items.push(lines[i].match(UL_RE)[1])
        i += 1
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (OL_RE.test(line)) {
      const items = []
      while (i < lines.length && OL_RE.test(lines[i])) {
        items.push(lines[i].match(OL_RE)[2])
        i += 1
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    if (QUOTE_RE.test(line)) {
      const buf = []
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        buf.push(lines[i].match(QUOTE_RE)[1])
        i += 1
      }
      blocks.push({ type: 'quote', text: buf.join(' ') })
      continue
    }

    if (TABLE_RE.test(line)) {
      const tableLines = []
      while (i < lines.length && TABLE_RE.test(lines[i])) {
        tableLines.push(lines[i])
        i += 1
      }
      blocks.push({ type: 'table', lines: tableLines })
      continue
    }

    // Default: paragraph — collect until blank line or known special start.
    const para = [line]
    i += 1
    while (i < lines.length) {
      const next = lines[i]
      if (
        next.trim() === '' ||
        HEADING_RE.test(next) ||
        UL_RE.test(next) ||
        OL_RE.test(next) ||
        QUOTE_RE.test(next) ||
        TABLE_RE.test(next) ||
        HR_RE.test(next.trim())
      ) {
        break
      }
      para.push(next)
      i += 1
    }
    blocks.push({ type: 'p', text: para.join(' ') })
  }

  return blocks
}

/* ── Inline tokenizer ─────────────────────────────────────────────
 * Walks each text node and replaces the first matching pattern with a
 * React element, recursing on the surrounding strings. Order matters:
 * `code` first (its contents must NOT be re-parsed), then links, then
 * bold, then italic. */

function tokenizeInline(text, prefix) {
  let tokens = [String(text)]
  let counter = 0
  const split = (re, build) => {
    tokens = tokens.flatMap((tok) => {
      if (typeof tok !== 'string') return [tok]
      const out = []
      let last = 0
      const flags = re.flags.includes('g') ? re.flags : re.flags + 'g'
      const r = new RegExp(re.source, flags)
      let m
      while ((m = r.exec(tok)) !== null) {
        if (m.index > last) out.push(tok.slice(last, m.index))
        out.push(build(m, `${prefix}-${counter++}`))
        last = r.lastIndex
        if (m[0].length === 0) r.lastIndex += 1
      }
      if (last < tok.length) out.push(tok.slice(last))
      return out
    })
  }

  split(/`([^`]+)`/, (m, k) => (
    <code
      key={k}
      className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[0.85em] font-mono text-emerald-200"
    >
      {m[1]}
    </code>
  ))
  split(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|[/#][^\s)]*)\)/,
    (m, k) => {
      const href = m[2]
      const external = /^https?:\/\//.test(href)
      return (
        <a
          key={k}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="text-cyan-300 underline decoration-cyan-400/30 underline-offset-2 hover:decoration-cyan-300"
        >
          {m[1]}
        </a>
      )
    },
  )
  split(/\*\*([^*\n]+)\*\*/, (m, k) => (
    <strong key={k} className="font-semibold text-white">
      {m[1]}
    </strong>
  ))
  split(/_([^_\n]+)_|\*([^*\n]+)\*/, (m, k) => (
    <em key={k} className="italic text-slate-200">
      {m[1] || m[2]}
    </em>
  ))

  return tokens
}

/* ── Block renderers ─────────────────────────────────────────────── */

function Inline({ text, k }) {
  return <>{tokenizeInline(text, k)}</>
}

function renderTable(tableLines, key) {
  if (tableLines.length < 2) return null

  const splitRow = (l) =>
    l
      .replace(/^\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map((c) => c.trim())

  const header = splitRow(tableLines[0])
  // tableLines[1] is the separator row (|---|---|), skip it
  const bodyRows = tableLines.slice(2).map(splitRow)

  return (
    <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5">
          <tr>
            {header.map((h, j) => (
              <th
                key={j}
                className="text-left text-[11px] uppercase tracking-wider text-slate-300 font-semibold px-4 py-2.5 border-b border-white/10"
              >
                <Inline text={h} k={`th-${j}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/6 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-slate-200/90 align-top">
                  <Inline text={cell} k={`td-${ri}-${ci}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderBlock(block, idx) {
  switch (block.type) {
    case 'heading': {
      const level = Math.min(4, Math.max(2, block.level))
      const Tag = `h${level}`
      const cls =
        level === 2
          ? 'mt-10 mb-4 font-display font-bold text-2xl sm:text-3xl text-white scroll-mt-24'
          : level === 3
            ? 'mt-7 mb-3 font-display font-bold text-xl sm:text-2xl text-white scroll-mt-24'
            : 'mt-6 mb-2 font-display font-semibold text-lg text-white scroll-mt-24'
      return (
        <Tag key={idx} className={cls}>
          <Inline text={block.text} k={`h${level}-${idx}`} />
        </Tag>
      )
    }
    case 'p':
      return (
        <p
          key={idx}
          className="my-4 text-[15px] sm:text-base text-slate-300 leading-[1.75]"
        >
          <Inline text={block.text} k={`p-${idx}`} />
        </p>
      )
    case 'ul':
      return (
        <ul key={idx} className="my-4 space-y-2 pl-5 list-disc marker:text-emerald-400">
          {block.items.map((it, i) => (
            <li key={i} className="text-[15px] sm:text-base text-slate-300 leading-[1.7]">
              <Inline text={it} k={`ul-${idx}-${i}`} />
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol
          key={idx}
          className="my-4 space-y-2 pl-5 list-decimal marker:text-amber-400 marker:font-semibold"
        >
          {block.items.map((it, i) => (
            <li key={i} className="text-[15px] sm:text-base text-slate-300 leading-[1.7] pl-1">
              <Inline text={it} k={`ol-${idx}-${i}`} />
            </li>
          ))}
        </ol>
      )
    case 'quote':
      return (
        <blockquote
          key={idx}
          className="my-6 border-l-4 border-emerald-500/60 pl-5 italic text-slate-200/95 text-[15px] sm:text-base leading-[1.75]"
        >
          <Inline text={block.text} k={`q-${idx}`} />
        </blockquote>
      )
    case 'hr':
      return <hr key={idx} className="my-8 border-white/10" />
    case 'table':
      return renderTable(block.lines, `t-${idx}`)
    default:
      return null
  }
}

/* ── Public component ────────────────────────────────────────────── */

export default function MarkdownArticle({ body, className = '' }) {
  const blocks = useMemo(() => parseBlocks(body), [body])
  if (!blocks.length) return null
  return <article className={className}>{blocks.map(renderBlock)}</article>
}
