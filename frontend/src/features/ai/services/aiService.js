import api, { API_BASE_URL } from '../../../api/client'

export async function chatWithAi(message, history = []) {
  // Backend AI_TIMEOUT_MS defaults to 20s — give the client a touch more so the
  // server's own timeout is what surfaces on slow LLMs, not the axios global 15s.
  const { data } = await api.post('/ai/chat', { message, history }, { timeout: 25000 })
  return data
}

/**
 * Streams a chat completion via SSE.
 * Supports an AbortSignal so the caller can stop generation mid-stream.
 *
 * @param {string} message
 * @param {Array<{role:'user'|'assistant', content:string}>} history
 * @param {{
 *   onMeta?: (payload:any) => void,
 *   onToken?: (chunk:string) => void,
 *   onDone?: (payload:any) => void,
 *   signal?: AbortSignal,
 * }} handlers
 */
export async function streamChatWithAi(message, history = [], handlers = {}) {
  const { signal, onMeta, onToken, onDone } = handlers

  const token = localStorage.getItem('jm_token')
  const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!response.ok) {
    let errMsg = 'Failed to stream AI response'
    try {
      const data = await response.json()
      errMsg = data?.error?.message || errMsg
    } catch {
      // keep generic
    }
    const err = new Error(errMsg)
    err.status = response.status
    throw err
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Streaming not supported in this browser')

  const decoder = new TextDecoder()
  let buffer = ''
  let finalPayload = { model: 'AI', followUps: [], usage: null, realtime: null }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        const dataLine = part
          .split('\n')
          .find((row) => row.startsWith('data: '))
        if (!dataLine) continue
        const raw = dataLine.slice(6).trim()
        if (!raw) continue

        let payload
        try {
          payload = JSON.parse(raw)
        } catch {
          continue
        }

        if (payload.type === 'meta') {
          finalPayload = {
            ...finalPayload,
            model: payload.model || 'AI',
            realtime: payload.realtime || null,
          }
          onMeta?.(payload)
        } else if (payload.type === 'token') {
          onToken?.(payload.content || '')
        } else if (payload.type === 'done') {
          finalPayload = {
            ...finalPayload,
            followUps: Array.isArray(payload.followUps) ? payload.followUps : [],
            usage: payload.usage || null,
          }
          onDone?.(payload)
        } else if (payload.type === 'end') {
          return finalPayload
        }
      }
    }
  } catch (err) {
    if (err?.name === 'AbortError') return finalPayload
    throw err
  }

  return finalPayload
}
