// Emails about applications and organisation admins, in German and English.
// Every value from users is escaped before it goes into HTML.

import { escapeHtml } from './escape-html';
import { PASSWORD_TOKEN_HOURS } from './password-tokens';
import type { Mail } from './email';

const wrap = (body: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;line-height:1.5">${body}<p style="color:#666;font-size:12px">grow</p></div>`;

export function approvalMail(to: string, organizationName: string): Mail {
  const name = escapeHtml(organizationName);
  return {
    to,
    subject: 'Ihr Antrag wurde genehmigt / Your application was approved',
    text:
      `Ihr Antrag für ${organizationName} wurde genehmigt. Die Organisation ist jetzt veröffentlicht.\n\n` +
      `Your application for ${organizationName} was approved. The organisation is now published.`,
    html: wrap(
      `<p>Ihr Antrag für <strong>${name}</strong> wurde genehmigt. Die Organisation ist jetzt veröffentlicht.</p>` +
        `<p>Your application for <strong>${name}</strong> was approved. The organisation is now published.</p>`
    ),
  };
}

export function rejectionMail(
  to: string,
  organizationName: string,
  notes?: string
): Mail {
  const name = escapeHtml(organizationName);
  const reasonText = notes ? `\n\nBegründung / Reason: ${notes}` : '';
  const reasonHtml = notes
    ? `<p><strong>Begründung / Reason:</strong> ${escapeHtml(notes)}</p>`
    : '';
  return {
    to,
    subject: 'Ihr Antrag / Your application',
    text:
      `Ihr Antrag für ${organizationName} wurde leider abgelehnt.\n\n` +
      `Unfortunately, your application for ${organizationName} was not approved.` +
      reasonText,
    html: wrap(
      `<p>Ihr Antrag für <strong>${name}</strong> wurde leider abgelehnt.</p>` +
        `<p>Unfortunately, your application for <strong>${name}</strong> was not approved.</p>` +
        reasonHtml
    ),
  };
}

export function setPasswordMail(
  to: string,
  organizationName: string,
  link: string
): Mail {
  const name = escapeHtml(organizationName);
  const safeLink = escapeHtml(link);
  return {
    to,
    subject: 'Ihr Admin-Zugang / Your admin account',
    text:
      `Sie sind jetzt Admin von ${organizationName}. Legen Sie hier Ihr Passwort fest (gültig ${PASSWORD_TOKEN_HOURS} Stunden, einmal verwendbar):\n${link}\n\n` +
      `You are now the admin of ${organizationName}. Set your password here (valid ${PASSWORD_TOKEN_HOURS} hours, works once):\n${link}`,
    html: wrap(
      `<p>Sie sind jetzt Admin von <strong>${name}</strong>. Legen Sie hier Ihr Passwort fest (gültig ${PASSWORD_TOKEN_HOURS} Stunden, einmal verwendbar):</p>` +
        `<p>You are now the admin of <strong>${name}</strong>. Set your password here (valid ${PASSWORD_TOKEN_HOURS} hours, works once):</p>` +
        `<p><a href="${safeLink}">${safeLink}</a></p>`
    ),
  };
}
