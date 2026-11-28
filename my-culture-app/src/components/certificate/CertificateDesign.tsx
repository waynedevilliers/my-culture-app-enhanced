// Certificate design after Christian's LaTeX template
// (docs/certificate-latex/certificate.tex). Frame and corner ornaments are
// the vector shapes from his PDF (public/certificate/frame.svg), recoloured
// with the preset colour; texts are real text in CMU Serif (Computer Modern).
//
// All sizes are in the PDF's points (792 x 612, A4-like landscape) and are
// converted to container-query units, so the certificate scales with the
// width of its container: preview, recipient page and print.

import localFont from 'next/font/local';
import type { CSSProperties } from 'react';

const cmuSerif = localFont({
  src: [
    {
      path: '../../fonts/cmu-serif/cmu-serif-500-roman.woff2',
      style: 'normal',
    },
    {
      path: '../../fonts/cmu-serif/cmu-serif-500-italic.woff2',
      style: 'italic',
    },
  ],
  display: 'swap',
});

// `tile` tints the background pattern; null keeps Christian's original tile.
export const CERTIFICATE_COLORS = {
  green: { frame: '#669466', text: '#193019', tile: null },
  blue: { frame: '#5f7fa3', text: '#19243a', tile: '#ecf0f6' },
  burgundy: { frame: '#9a5f66', text: '#301919', tile: '#f6ecee' },
  grey: { frame: '#7d7d7d', text: '#222222', tile: '#efefef' },
} as const;

const TILE = {
  size: `${(113.386 / 7.92).toFixed(4)}cqw ${(56.693 / 7.92).toFixed(4)}cqw`,
  position: `0 ${(-11.622 / 7.92).toFixed(4)}cqw`,
};

const DATE_LOCALES = { de: 'de-DE', en: 'en-GB' } as const;

/** Shown when the organisation has no logo of its own. */
export const FALLBACK_LOGO = '/logo/grow.png';

type CertificateColor = keyof typeof CERTIFICATE_COLORS;
type CertificateLanguage = 'de' | 'en';

const WORDS: Record<
  CertificateLanguage,
  { certificateOf: string; to: string }
> = {
  de: { certificateOf: 'Zertifikat für', to: 'verliehen an:' },
  en: { certificateOf: 'Certificate of', to: 'to:' },
};

interface CertificateSignature {
  name: string;
  role: string;
}

export interface CertificateDesignProps {
  organizationName: string;
  /** The organisation's logo; without one the grow logo is shown. */
  logoUrl?: string | null;
  introText: string;
  achievement: string;
  recipientName: string;
  addition?: string | null;
  signatures: CertificateSignature[];
  /** Issue date, shown small under the signatures. */
  issuedDate?: Date | string | null;
  language?: CertificateLanguage;
  color?: CertificateColor;
}

/** PDF points -> container-query width units (792 pt = 100cqw). */
const u = (pt: number) => `${(pt / 7.92).toFixed(4)}cqw`;

/** A line whose text baseline sits at `baseline` pt. */
const line = (baseline: number, size: number): CSSProperties => ({
  position: 'absolute',
  left: u(120),
  right: u(120),
  top: u(baseline - 0.75 * size),
  fontSize: u(size),
  lineHeight: 1.05,
  textAlign: 'center',
});

const SMALL = 16.2; // \tiny, scaled 3x in the LaTeX template

export default function CertificateDesign({
  organizationName,
  logoUrl,
  introText,
  achievement,
  recipientName,
  addition,
  signatures,
  language = 'de',
  color = 'green',
  issuedDate,
}: CertificateDesignProps) {
  const words = WORDS[language];
  const colors = CERTIFICATE_COLORS[color] ?? CERTIFICATE_COLORS.green;
  const shownSignatures = signatures.filter((s) => s.name.trim()).slice(0, 3);
  const date = issuedDate ? new Date(issuedDate) : null;
  const formattedDate =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString(DATE_LOCALES[language], {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Europe/Berlin',
        })
      : null;

  return (
    <div
      className="certificate-design"
      lang={language}
      style={{ containerType: 'inline-size', width: '100%' }}
    >
      <div
        className={cmuSerif.className}
        style={{
          position: 'relative',
          width: '100cqw',
          aspectRatio: '792 / 612',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          ...(colors.tile
            ? {}
            : {
                backgroundImage: 'url(/certificate/background-tile.png)',
                backgroundSize: TILE.size,
                backgroundPosition: TILE.position,
              }),
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {colors.tile && (
          // The same pattern, tinted to match the frame colour.
          <div
            aria-hidden="true"
            data-testid="certificate-tile"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: colors.tile,
              maskImage: 'url(/certificate/background-tile.png)',
              maskSize: TILE.size,
              maskPosition: TILE.position,
              WebkitMaskImage: 'url(/certificate/background-tile.png)',
              WebkitMaskSize: TILE.size,
              WebkitMaskPosition: TILE.position,
            }}
          />
        )}
        <div
          aria-hidden="true"
          data-testid="certificate-frame"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: colors.frame,
            maskImage: 'url(/certificate/frame.svg)',
            maskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: 'url(/certificate/frame.svg)',
            WebkitMaskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />

        <img
          src={logoUrl || FALLBACK_LOGO}
          alt=""
          style={{
            position: 'absolute',
            // Same height and centre as Christian's logo; wide logos may
            // be up to about twice as wide as high.
            left: '50%',
            transform: 'translateX(-50%)',
            top: u(56.461),
            maxWidth: u(200),
            height: u(93.54),
            objectFit: 'contain',
          }}
        />

        <div style={{ ...line(181.3, 27), color: '#301919' }}>
          {organizationName}
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: u(506),
            top: u(217.2 - 0.75 * SMALL - 10.5),
            fontSize: u(SMALL),
            lineHeight: u(35.9),
            letterSpacing: '0.09em',
            textAlign: 'center',
            color: colors.text,
          }}
        >
          {introText}
        </div>

        <div
          style={{
            ...line(297.9 - 1.5, 30),
            fontStyle: 'italic',
            color: '#5e1919',
          }}
        >
          {words.certificateOf}
        </div>

        <div
          style={{
            ...line(333.8 - 3, 36),
            color: '#000000',
            fontVariantCaps: 'small-caps',
          }}
        >
          {achievement}
        </div>

        <div
          style={{
            ...line(368.7, SMALL),
            letterSpacing: '0.09em',
            color: colors.frame,
          }}
        >
          {words.to}{' '}
          <span
            style={{
              textDecoration: 'underline',
              textDecorationThickness: u(1.2),
              textUnderlineOffset: u(3),
            }}
          >
            {recipientName}
          </span>
        </div>

        {addition && (
          <div
            style={{
              ...line(386.6, SMALL),
              letterSpacing: '0.09em',
              color: colors.frame,
            }}
          >
            {addition}
          </div>
        )}

        {shownSignatures.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: u(427.8),
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'grid',
              gridTemplateColumns: `repeat(${shownSignatures.length}, ${u(153)})`,
              columnGap: u(24),
              color: '#000066',
              fontSize: u(11),
              lineHeight: 1.2,
              letterSpacing: '0.09em',
              textAlign: 'center',
            }}
          >
            {shownSignatures.map((signature, index) => (
              <div key={index}>
                <div
                  style={{
                    borderTop: `${u(0.84)} solid #000066`,
                    marginBottom: u(12),
                  }}
                />
                {signature.name}
                <br />
                {signature.role}
              </div>
            ))}
          </div>
        )}

        {formattedDate && (
          <div
            style={{
              ...line(shownSignatures.length > 0 ? 488 : 440, 11),
              letterSpacing: '0.09em',
              color: '#000066',
            }}
          >
            {formattedDate}
          </div>
        )}
      </div>
    </div>
  );
}
