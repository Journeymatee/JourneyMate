'use strict'

/**
 * Booking confirmation email template + sender.
 *
 * Uses the shared `sendMail` wrapper so we inherit the "transport
 * disabled in dev" graceful path. The template is a self-contained
 * inline-styled HTML string so it renders correctly across Gmail,
 * Outlook, Apple Mail, and the slate of mobile clients.
 */

const { sendMail, escapeHtml, isMailEnabled } = require('../../lib/mailer')
const logger = require('../../lib/logger')

function fmtInr(n) {
  if (!Number.isFinite(Number(n))) return '—'
  return `\u20B9${Number(n).toLocaleString('en-IN')}`
}

function pretty(typeCode) {
  return ({ train: 'Train', flight: 'Flight', hotel: 'Hotel' }[typeCode] || 'Trip')
}

function buildHtml(b) {
  const total = fmtInr(b.price_inr)
  const safeRef = escapeHtml(b.booking_ref)
  const safeProvider = escapeHtml(b.provider || 'mock')
  const passengers = Array.isArray(b.payload?.passengers) ? b.payload.passengers : []
  const passengerRows = passengers
    .map((p, i) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eef2ff;color:#475569;font-size:13px;">${i + 1}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eef2ff;color:#0f172a;font-size:13px;">${escapeHtml(p.fullName || '—')}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eef2ff;color:#475569;font-size:13px;text-align:right;">${escapeHtml(String(p.age ?? '—'))} · ${escapeHtml(p.gender || '—')}</td>
      </tr>
    `)
    .join('')

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f7fb;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#10b981 0%,#0ea5e9 100%);color:#ffffff;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;font-weight:700;">JourneyMate</div>
        <div style="margin-top:6px;font-size:22px;font-weight:800;letter-spacing:-0.02em;">Booking confirmed</div>
        <div style="margin-top:4px;font-size:13px;opacity:0.92;">${pretty(b.type)} · ${escapeHtml(b.origin)} \u2192 ${escapeHtml(b.destination || b.origin)}</div>
      </div>

      <div style="padding:24px 28px;">
        <div style="font-size:13px;color:#64748b;">Booking reference</div>
        <div style="margin-top:4px;font-size:20px;font-weight:800;letter-spacing:0.04em;">${safeRef}</div>

        <table style="width:100%;margin-top:20px;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:8px 0;color:#64748b;">Provider</td>
            <td style="padding:8px 0;text-align:right;color:#0f172a;font-weight:600;">${safeProvider}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Travel date</td>
            <td style="padding:8px 0;text-align:right;color:#0f172a;font-weight:600;">${escapeHtml(b.travel_date || '—')}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Class / room</td>
            <td style="padding:8px 0;text-align:right;color:#0f172a;font-weight:600;">${escapeHtml(b.payload?.classCode || b.plan || '—')}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Total paid</td>
            <td style="padding:8px 0;text-align:right;color:#0f172a;font-weight:800;font-size:16px;">${total}</td>
          </tr>
        </table>

        ${passengers.length > 0 ? `
          <div style="margin-top:20px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-weight:700;">Passengers</div>
          <table style="width:100%;margin-top:8px;border-collapse:collapse;">
            ${passengerRows}
          </table>
        ` : ''}

        <div style="margin-top:24px;padding:14px 16px;border-radius:12px;background:#fef3c7;border:1px solid #fde68a;color:#78350f;font-size:12px;line-height:1.55;">
          <strong>Demo booking.</strong> JourneyMate is not yet an authorised IRCTC / IATA / hotel booking partner, so this confirmation is for the user-experience demo. No real seat / room is held and no money has been charged.
        </div>

        <div style="margin-top:20px;font-size:12px;color:#64748b;line-height:1.6;">
          You can review or cancel this booking any time from the
          <a href="#" style="color:#0ea5e9;text-decoration:none;font-weight:600;">My bookings</a>
          page in the app.
        </div>
      </div>

      <div style="padding:14px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;letter-spacing:0.06em;">
        \u00A9 ${new Date().getFullYear()} JourneyMate \u00B7 booked via ${safeProvider}
      </div>
    </div>
  </body>
</html>`
}

function buildText(b) {
  return [
    `JourneyMate — Booking confirmed`,
    `Reference: ${b.booking_ref}`,
    `${pretty(b.type)}: ${b.origin} → ${b.destination || b.origin}`,
    `Travel date: ${b.travel_date || '—'}`,
    `Total: ${fmtInr(b.price_inr)}`,
    ``,
    `This is a demo booking — JourneyMate is not yet an authorised`,
    `IRCTC / IATA / hotel booking partner, so no real seat is held and`,
    `no money has been charged.`,
  ].join('\n')
}

async function sendBookingConfirmation({ booking, recipientEmail }) {
  if (!isMailEnabled()) {
    logger.info?.({ msg: 'booking.email.skipped', reason: 'mail disabled', ref: booking?.booking_ref })
    return { ok: false, skipped: true }
  }
  if (!recipientEmail) {
    logger.warn?.({ msg: 'booking.email.skipped', reason: 'no recipient', ref: booking?.booking_ref })
    return { ok: false, skipped: true }
  }
  return sendMail({
    to:      recipientEmail,
    subject: `JourneyMate · Booking ${booking.booking_ref} confirmed`,
    text:    buildText(booking),
    html:    buildHtml(booking),
  })
}

module.exports = { sendBookingConfirmation }
