'use strict'

/**
 * Contact-form service
 * --------------------
 * One entry point: `submit({ name, email, topic, message, meta })`.
 *
 * Pipeline:
 *   1. Validate the user's email address (server-side; same rules used by
 *      /auth so we don't accept disposable or fake addresses).
 *   2. Email the *site owner* (OWNER_EMAIL) with the message — `replyTo` is
 *      set to the user's address so a simple "Reply" in the inbox goes
 *      straight back to them.
 *   3. Generate an auto-reply by feeding the message into the AI assistant
 *      (`ai.service.chat()`). Falls back to the deterministic local NLP
 *      assistant when no AI key is configured, so the user always gets a
 *      same-second reply.
 *   4. Email the AI reply back to the user with a short signature.
 *
 * Failure handling: each leg fails independently. If the owner-email step
 * fails we still try to auto-reply, and vice-versa, so a flaky SMTP
 * provider never makes the user think the form is broken.
 */

const env = require('../../config/env')
const logger = require('../../lib/logger')
const ApiError = require('../../lib/ApiError')
const { sendMail, isMailEnabled, escapeHtml } = require('../../lib/mailer')
const { validateEmail } = require('../../lib/emailValidator')
const aiService = require('../ai/ai.service')

const NAME_MAX = 80
const TOPIC_MAX = 80
const MESSAGE_MIN = 10
const MESSAGE_MAX = 4000

function clean(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function brandTag() {
  return 'JourneyMate'
}

function ownerNotificationHtml({ name, email, topic, message, meta }) {
  const ip = escapeHtml(meta?.ip || 'unknown')
  const ua = escapeHtml(meta?.userAgent || 'unknown')
  const time = escapeHtml(new Date().toUTCString())
  return `
<!doctype html>
<html><body style="margin:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(15,23,42,0.06);">
      <div style="padding:18px 24px;background:linear-gradient(135deg,#10b981,#06b6d4);color:white;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:.85;">${brandTag()} · Contact form</div>
        <div style="font-size:18px;font-weight:700;margin-top:2px;">New message from ${escapeHtml(name)}</div>
      </div>
      <div style="padding:22px 24px;">
        <table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse;">
          <tr><td style="color:#64748b;width:96px;padding:6px 0;">From</td><td style="padding:6px 0;"><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</td></tr>
          <tr><td style="color:#64748b;padding:6px 0;">Topic</td><td style="padding:6px 0;">${escapeHtml(topic) || '<em style="color:#94a3b8;">(none)</em>'}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0;">Sent</td><td style="padding:6px 0;">${time}</td></tr>
        </table>
        <div style="margin-top:18px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;white-space:pre-wrap;line-height:1.55;">${escapeHtml(message)}</div>
        <div style="margin-top:14px;font-size:11px;color:#94a3b8;">
          Submitted from ${ip} · ${ua}
        </div>
      </div>
      <div style="padding:14px 24px;border-top:1px solid #f1f5f9;font-size:12px;color:#64748b;">
        Reply directly to this email — it goes straight back to ${escapeHtml(email)}.
      </div>
    </div>
  </div>
</body></html>`
}

function ownerNotificationText({ name, email, topic, message, meta }) {
  return [
    `New message via JourneyMate contact form`,
    ``,
    `From: ${name} <${email}>`,
    `Topic: ${topic || '(none)'}`,
    `Sent: ${new Date().toUTCString()}`,
    `IP: ${meta?.ip || 'unknown'}`,
    ``,
    `Message:`,
    message,
    ``,
    `Reply directly to this email to respond to ${email}.`,
  ].join('\n')
}

function autoReplyHtml({ name, message, aiReply }) {
  // Convert markdown-ish bullets/bold to a simple plain HTML block. We keep
  // it minimal so the AI's text is the focus.
  const safeReply = escapeHtml(aiReply)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
  const safeOriginal = escapeHtml(message).replace(/\n/g, '<br/>')

  return `
<!doctype html>
<html><body style="margin:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,0.08);">
      <div style="padding:22px 24px;background:linear-gradient(135deg,#10b981,#06b6d4);color:white;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:.85;">${brandTag()} · AI reply</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">Hi ${escapeHtml(name) || 'there'} 👋</div>
      </div>
      <div style="padding:22px 24px;font-size:14.5px;line-height:1.65;">
        <p style="margin:0 0 14px 0;color:#334155;">
          Thanks for reaching out — your message has landed in our inbox.
          Here's a quick answer from <strong>JourneyMate AI</strong> while a human
          gets ready to follow up (within 24 hours):
        </p>
        <div style="margin:6px 0 18px 0;padding:16px 18px;background:linear-gradient(135deg,#ecfeff,#f0fdf4);border:1px solid #bae6fd;border-radius:14px;color:#0f172a;">
          ${safeReply}
        </div>
        <details style="margin-top:18px;border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px;background:#f8fafc;font-size:13px;color:#475569;">
          <summary style="cursor:pointer;font-weight:600;color:#334155;">Your original message</summary>
          <div style="margin-top:8px;line-height:1.55;">${safeOriginal}</div>
        </details>
        <p style="margin:22px 0 0 0;font-size:13px;color:#64748b;">
          – The JourneyMate team<br/>
          <a href="https://journeymate.app" style="color:#0ea5e9;text-decoration:none;">journeymate.app</a>
        </p>
      </div>
      <div style="padding:14px 24px;border-top:1px solid #f1f5f9;font-size:11.5px;color:#94a3b8;">
        This is an automated reply generated by JourneyMate AI. A human will
        get back to you personally if your message needs more than a quick
        answer. You can simply reply to this email — we read everything.
      </div>
    </div>
  </div>
</body></html>`
}

function autoReplyText({ name, message, aiReply }) {
  return [
    `Hi ${name || 'there'},`,
    ``,
    `Thanks for reaching out to JourneyMate. Here's a quick AI-generated`,
    `answer while a human gets ready to follow up (within 24 hours):`,
    ``,
    aiReply,
    ``,
    `--- Your original message ---`,
    message,
    ``,
    `– The JourneyMate team`,
    `https://journeymate.app`,
    ``,
    `(This is an automated reply. Replying to this email reaches a human.)`,
  ].join('\n')
}

/**
 * Generate an AI auto-reply that's grounded in the contact-form context.
 * Wraps the message with a short instruction so the model behaves like a
 * support agent instead of a travel planner.
 */
async function generateAiReply({ name, email, topic, message }) {
  const prompt = [
    `A visitor just submitted the JourneyMate contact form. Reply as a warm,`,
    `helpful support rep in 3-4 short paragraphs (or a tight bulleted list when`,
    `appropriate). Acknowledge the topic, give a useful answer, and end with one`,
    `concrete next step. If the message is a bug report, ask for one extra`,
    `detail (browser/device/screenshot). Never invent prices, schedules, or`,
    `internal info. Sign off as "JourneyMate Support".`,
    ``,
    `Visitor: ${name || 'Anonymous'} <${email}>`,
    `Topic: ${topic || 'General enquiry'}`,
    ``,
    `Their message:`,
    `"""`,
    message,
    `"""`,
  ].join('\n')

  try {
    const result = await aiService.chat({
      message: prompt,
      history: [],
      user: { name: name || 'Visitor', email },
    })
    const reply = String(result?.reply || '').trim()
    if (reply) return reply
  } catch (err) {
    logger.warn?.({ msg: 'contact.ai.failed', err: err?.message })
  }
  // Last-resort canned reply so the user never gets an empty email.
  return [
    `Thanks for getting in touch! We've received your message and a human`,
    `from the JourneyMate team will reply within the next 24 hours.`,
    ``,
    `In the meantime, feel free to browse popular routes or chat with the in-app`,
    `assistant — it can plan a trip, compare budget vs luxury, or suggest food`,
    `for any city in India.`,
    ``,
    `– JourneyMate Support`,
  ].join('\n')
}

async function submit({ name, email, topic, message, meta }) {
  const cleanName = clean(name, NAME_MAX)
  const cleanTopic = clean(topic, TOPIC_MAX)
  const cleanMessage = String(message || '').trim().slice(0, MESSAGE_MAX)

  if (!cleanName) throw ApiError.badRequest('Please tell us your name')
  if (cleanMessage.length < MESSAGE_MIN) {
    throw ApiError.badRequest(
      `Your message is too short — please add a few more details (min ${MESSAGE_MIN} characters).`
    )
  }

  const emailCheck = await validateEmail(email).catch(() => ({
    ok: false,
    reason: 'Could not verify your email address.',
  }))
  if (!emailCheck.ok) {
    throw ApiError.badRequest(emailCheck.reason || 'Please enter a valid email address.')
  }
  const cleanEmail = emailCheck.normalized

  // ── Step 1: notify owner ─────────────────────────────────────────────
  const owner = env.OWNER_EMAIL
  let ownerSent = false
  if (owner && isMailEnabled()) {
    const result = await sendMail({
      to: owner,
      replyTo: `${cleanName} <${cleanEmail}>`,
      subject: `📨 ${cleanTopic || 'New contact'} — ${cleanName}`,
      text: ownerNotificationText({
        name: cleanName,
        email: cleanEmail,
        topic: cleanTopic,
        message: cleanMessage,
        meta,
      }),
      html: ownerNotificationHtml({
        name: cleanName,
        email: cleanEmail,
        topic: cleanTopic,
        message: cleanMessage,
        meta,
      }),
    })
    ownerSent = result.ok
  } else {
    logger.warn?.({
      msg: 'contact.owner.skipped',
      reason: !owner ? 'OWNER_EMAIL not configured' : 'mailer disabled',
    })
  }

  // ── Step 2: generate AI auto-reply ───────────────────────────────────
  const aiReply = await generateAiReply({
    name: cleanName,
    email: cleanEmail,
    topic: cleanTopic,
    message: cleanMessage,
  })

  // ── Step 3: send the auto-reply to the visitor ───────────────────────
  let userSent = false
  if (isMailEnabled()) {
    const result = await sendMail({
      to: `${cleanName} <${cleanEmail}>`,
      replyTo: owner || undefined,
      subject: `Thanks for reaching out — JourneyMate`,
      text: autoReplyText({ name: cleanName, message: cleanMessage, aiReply }),
      html: autoReplyHtml({ name: cleanName, message: cleanMessage, aiReply }),
    })
    userSent = result.ok
  }

  logger.info?.({
    msg: 'contact.submitted',
    name: cleanName,
    email: cleanEmail,
    topic: cleanTopic,
    ownerSent,
    userSent,
  })

  return {
    ok: true,
    ownerNotified: ownerSent,
    autoReplySent: userSent,
    aiReply,
  }
}

module.exports = { submit }
