import api, { API_BASE_URL } from '../api/client'

export async function chatWithAi(message, history = []) {
  const { data } = await api.post('/ai/chat', { message, history })
  return data
}

export async function streamChatWithAi(message, history = [], handlers = {}) {
  const token = localStorage.getItem('jm_token')
  const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  })

  if (!response.ok) {
    let errMsg = 'Failed to stream AI response'
    try {
      const data = await response.json()
      errMsg = data?.error?.message || errMsg
    } catch {
      // Ignore parse errors and keep generic message.
    }
    throw new Error(errMsg)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Streaming not supported in this browser')

  const decoder = new TextDecoder()
  let buffer = ''
  let finalPayload = { model: 'AI', followUps: [], usage: null }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      const line = part
        .split('\n')
        .find((row) => row.startsWith('data: '))
      if (!line) continue
      const raw = line.slice(6).trim()
      if (!raw) continue

      let payload
      try {
        payload = JSON.parse(raw)
      } catch {
        continue
      }

      if (payload.type === 'meta') {
        finalPayload = { ...finalPayload, model: payload.model || 'AI' }
        handlers.onMeta?.(payload)
      } else if (payload.type === 'token') {
        handlers.onToken?.(payload.content || '')
      } else if (payload.type === 'done') {
        finalPayload = {
          ...finalPayload,
          followUps: Array.isArray(payload.followUps) ? payload.followUps : [],
          usage: payload.usage || null,
        }
        handlers.onDone?.(payload)
      } else if (payload.type === 'end') {
        return finalPayload
      }
    }
  }

  return finalPayload
}
