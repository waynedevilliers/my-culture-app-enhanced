// Sending email over SMTP (same settings as Salon77). Without EMAIL_HOST and
// EMAIL_FROM nothing is sent and callers get `false`, so a missing setup
// never fails a request.

import nodemailer from 'nodemailer';

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

export function mailConfig(
  env: Record<string, string | undefined> = process.env
): MailConfig | null {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_FROM,
  } = env;
  if (!EMAIL_HOST || !EMAIL_FROM) return null;
  const port = Number(EMAIL_PORT || '587');
  if (!Number.isInteger(port)) return null;
  return {
    host: EMAIL_HOST,
    port,
    secure: EMAIL_SECURE === 'true',
    user: EMAIL_USER || undefined,
    pass: EMAIL_PASS || undefined,
    from: EMAIL_FROM,
  };
}

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Error type only: never the message, which can contain addresses.
function errorKind(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? `${error.name} ${code}` : error.name;
  }
  return 'unknown';
}

/** Send one mail. Returns true when it was handed to the SMTP server. */
export async function sendMail(mail: Mail): Promise<boolean> {
  const config = mailConfig();
  if (!config) return false;

  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    });
    await transport.sendMail({ from: config.from, ...mail });
    return true;
  } catch (error) {
    console.error('Email failed:', errorKind(error));
    return false;
  }
}
