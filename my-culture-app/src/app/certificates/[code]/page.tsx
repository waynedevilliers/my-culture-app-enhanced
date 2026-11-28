// Private certificate page: /certificates/<code>. Anyone with the link can
// view, print and save the certificate as a PDF; nobody can find it without
// the link. Revoked links show a notice instead of the certificate.

import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isRecipientCode, logCertificateEvent } from '@/lib/certificates';
import CertificateDesign, {
  CERTIFICATE_COLORS,
} from '@/components/certificate/CertificateDesign';
import PrintButton from '@/components/certificate/PrintButton';

// Always read fresh, so a revoked link stops working at once.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ code: string }> };

const loadRecipient = cache(async (code: string) => {
  if (!isRecipientCode(code)) return null;
  return prisma.certificateRecipient.findUnique({
    where: { code },
    select: {
      id: true,
      name: true,
      revokedAt: true,
      certificate: {
        select: {
          id: true,
          language: true,
          color: true,
          introText: true,
          achievement: true,
          addition: true,
          signatures: true,
          issuedDate: true,
          organization: {
            select: { name: true, logo: { select: { url: true } } },
          },
        },
      },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipient = await loadRecipient((await params).code);
  const usable = recipient && !recipient.revokedAt;
  return {
    title: usable
      ? `${recipient.certificate.language === 'en' ? 'Certificate' : 'Zertifikat'}: ${recipient.certificate.achievement}`
      : 'Zertifikat / Certificate',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  };
}

const isSignature = (value: unknown): value is { name: string; role: string } =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { name?: unknown }).name === 'string' &&
  typeof (value as { role?: unknown }).role === 'string';

export default async function CertificatePage({ params }: Props) {
  const recipient = await loadRecipient((await params).code);
  if (!recipient) notFound();

  if (recipient.revokedAt) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-4">
            Zertifikat nicht verfügbar / Certificate not available
          </h1>
          <p>
            Dieser Link wurde vom Aussteller deaktiviert. Bitte wenden Sie sich
            an die Organisation, die das Zertifikat ausgestellt hat.
          </p>
          <p className="mt-2">
            This link was turned off by the issuer. Please contact the
            organisation that issued the certificate.
          </p>
        </div>
      </main>
    );
  }

  const { certificate } = recipient;
  logCertificateEvent('viewed', {
    certificateId: certificate.id,
    recipientId: recipient.id,
  });

  const language = certificate.language === 'en' ? 'en' : 'de';
  const color =
    certificate.color in CERTIFICATE_COLORS
      ? (certificate.color as keyof typeof CERTIFICATE_COLORS)
      : 'green';
  const signatures = Array.isArray(certificate.signatures)
    ? certificate.signatures.filter(isSignature)
    : [];

  return (
    <main
      lang={language}
      className="min-h-screen flex flex-col items-center gap-6 p-4 sm:p-8 print:p-0 print:block"
    >
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          html, body { background: #fff; }
          .certificate-sheet { width: calc(210mm * 792 / 612); margin: 0 auto; box-shadow: none; }
        }
      `}</style>
      <div className="certificate-sheet w-full max-w-screen-xl shadow-lg">
        <CertificateDesign
          organizationName={certificate.organization.name}
          logoUrl={certificate.organization.logo?.url}
          introText={certificate.introText}
          achievement={certificate.achievement}
          recipientName={recipient.name}
          addition={certificate.addition}
          signatures={signatures}
          issuedDate={certificate.issuedDate}
          language={language}
          color={color}
        />
      </div>
      <PrintButton
        label={
          language === 'en'
            ? 'Print or save as PDF'
            : 'Drucken oder als PDF speichern'
        }
      />
    </main>
  );
}
