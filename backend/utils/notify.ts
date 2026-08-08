import fs from 'fs';
import path from 'path';

const INQUIRE_TO = process.env.INQUIRE_EMAIL || '0.x.hum.ai.0@gmail.com';

function dataDir() {
  return process.env.XHUMAI_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), 'logs');
}

/**
 * Every inquiry is logged. Email is sent when SMTP or RESEND is configured.
 * Autonomy: the core never drops an input on the floor.
 */
export async function notifyInquiry(payload: {
  text: string;
  type?: string;
  reply?: string;
  status?: string;
  meta?: Record<string, unknown>;
}) {
  const dir = dataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const entry = {
    ...payload,
    to: INQUIRE_TO,
    timestamp: new Date().toISOString(),
  };
  try {
    fs.appendFileSync(path.join(dir, 'inquiries.jsonl'), JSON.stringify(entry) + '\n');
  } catch (e) {
    console.error('inquiry log failed', e);
  }

  const subject = `[XhumAI] ${payload.type || 'inquiry'} — ${(payload.text || '').slice(0, 60)}`;
  const body = [
    'XhumAI Quantum Core — inquiry feed',
    `Time: ${entry.timestamp}`,
    `Type: ${payload.type || 'unknown'}`,
    `Status: ${payload.status || ''}`,
    '',
    '--- message ---',
    payload.text,
    '',
    '--- reply ---',
    payload.reply || '(none)',
    '',
    payload.meta ? `meta: ${JSON.stringify(payload.meta)}` : '',
  ].join('\n');

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'XhumAI <onboarding@resend.dev>',
          to: [INQUIRE_TO],
          subject,
          text: body,
        }),
      });
      const ok = res.ok;
      console.log('[NOTIFY] resend', ok ? 'sent' : await res.text());
      return { emailed: ok, channel: 'resend' };
    } catch (e: any) {
      console.error('[NOTIFY] resend failed', e.message);
    }
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === '1',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: INQUIRE_TO,
        subject,
        text: body,
      });
      console.log('[NOTIFY] smtp sent');
      return { emailed: true, channel: 'smtp' };
    } catch (e: any) {
      console.error('[NOTIFY] smtp failed', e.message);
    }
  }

  console.log('[NOTIFY] logged only (set RESEND_API_KEY or SMTP_* to email)');
  return { emailed: false, channel: 'log' };
}
