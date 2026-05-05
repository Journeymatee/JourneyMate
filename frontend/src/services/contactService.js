import api from '../api/client'

/**
 * Submit the public contact form.
 *
 *   sendContactMessage({ name, email, topic, message })
 *
 * Returns the backend payload:
 *   {
 *     ok: true,
 *     ownerNotified: boolean,   // did we email the site owner?
 *     autoReplySent: boolean,   // did the user receive an AI reply?
 *     aiReply: string,          // the AI text (also useful to render inline)
 *   }
 *
 * On error, throws an Error whose message is the human-readable problem so
 * the form can surface it directly.
 */
export async function sendContactMessage({ name, email, topic, message }) {
  try {
    const res = await api.post(
      '/contact',
      {
        name: String(name || '').trim(),
        email: String(email || '').trim(),
        topic: String(topic || '').trim(),
        message: String(message || '').trim(),
      },
      { timeout: 25_000 }
    )
    return res.data
  } catch (err) {
    const e = err?.response?.data?.error
    let msg
    if (e == null) msg = err?.message
    else if (typeof e === 'string') msg = e
    else if (e.message) msg = e.message
    else if (Array.isArray(e.details) && e.details[0]?.msg) msg = e.details[0].msg
    else msg = err?.message
    throw new Error(msg || 'Could not send your message. Please try again.')
  }
}
