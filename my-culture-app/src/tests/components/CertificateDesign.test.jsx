import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/font/local', () => ({ default: () => ({ className: 'cmu' }) }));

import CertificateDesign, {
  CERTIFICATE_COLORS,
} from '../../components/certificate/CertificateDesign';

const base = {
  organizationName: 'Culture Academy e. V.',
  logoUrl: '/logo/grow.png',
  introText: 'Für herausragendes Engagement verleihen wir das',
  achievement: 'Kulturpraktikum 2026',
  recipientName: 'Maria Musterfrau',
  addition: '(120 Stunden)',
  signatures: [
    { name: 'Christian Beispiel', role: 'Vorstand' },
    { name: 'Ada Lovelace', role: 'Kursleitung' },
  ],
};

describe('CertificateDesign', () => {
  it('shows every field', () => {
    render(<CertificateDesign {...base} />);
    for (const text of [
      'Culture Academy e. V.',
      'Für herausragendes Engagement verleihen wir das',
      'Kulturpraktikum 2026',
      'Maria Musterfrau',
      '(120 Stunden)',
      'Christian Beispiel',
      'Kursleitung',
    ]) {
      expect(screen.getByText(text, { exact: false })).toBeInTheDocument();
    }
    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      '/logo/grow.png'
    );
  });

  it('uses German words by default and English on request', () => {
    const { rerender } = render(<CertificateDesign {...base} />);
    expect(screen.getByText('Zertifikat für')).toBeInTheDocument();
    expect(
      screen.getByText('verliehen an:', { exact: false })
    ).toBeInTheDocument();
    expect(document.querySelector('[lang="de"]')).not.toBeNull();

    rerender(<CertificateDesign {...base} language="en" />);
    expect(screen.getByText('Certificate of')).toBeInTheDocument();
    expect(screen.getByText('to:', { exact: false })).toBeInTheDocument();
  });

  it('shows at most three signatures and skips empty ones', () => {
    render(
      <CertificateDesign
        {...base}
        signatures={[
          { name: 'Signer One', role: 'r1' },
          { name: '  ', role: 'empty' },
          { name: 'Signer Two', role: 'r2' },
          { name: 'Signer Three', role: 'r3' },
          { name: 'Signer Four', role: 'r4' },
        ]}
      />
    );
    expect(screen.queryByText('empty', { exact: false })).toBeNull();
    expect(
      screen.getByText('Signer Three', { exact: false })
    ).toBeInTheDocument();
    expect(screen.queryByText('Signer Four', { exact: false })).toBeNull();
  });

  it('leaves out logo, addition and signatures when not given', () => {
    render(
      <CertificateDesign
        {...base}
        logoUrl={null}
        addition={null}
        signatures={[]}
      />
    );
    expect(document.querySelector('img')).toBeNull();
    expect(screen.queryByText('(120 Stunden)')).toBeNull();
    expect(screen.queryByText('Vorstand', { exact: false })).toBeNull();
  });

  it('colours the frame and recipient with the chosen preset', () => {
    render(<CertificateDesign {...base} color="blue" />);
    const frame = screen.getByTestId('certificate-frame');
    expect(frame.style.backgroundColor).toBe('rgb(95, 127, 163)');
    expect(CERTIFICATE_COLORS.blue.frame).toBe('#5f7fa3');
  });

  it("keeps Christian's tile for green and tints it for other colours", () => {
    const { rerender } = render(<CertificateDesign {...base} />);
    expect(screen.queryByTestId('certificate-tile')).toBeNull();

    rerender(<CertificateDesign {...base} color="burgundy" />);
    expect(screen.getByTestId('certificate-tile').style.backgroundColor).toBe(
      'rgb(246, 236, 238)'
    );
  });

  it('shows the issue date in the certificate language', () => {
    const { rerender } = render(
      <CertificateDesign {...base} issuedDate="2026-11-28T10:00:00Z" />
    );
    expect(screen.getByText('28. November 2026')).toBeInTheDocument();

    rerender(
      <CertificateDesign
        {...base}
        language="en"
        issuedDate="2026-11-28T10:00:00Z"
      />
    );
    expect(screen.getByText('28 November 2026')).toBeInTheDocument();
  });

  it('shows no date when none or an invalid one is given', () => {
    const { rerender } = render(<CertificateDesign {...base} />);
    expect(screen.queryByText(/November/)).toBeNull();
    rerender(<CertificateDesign {...base} issuedDate="not a date" />);
    expect(screen.queryByText(/Invalid/)).toBeNull();
  });

  it('renders user text as text, not HTML', () => {
    render(<CertificateDesign {...base} recipientName="<b>x</b>" />);
    expect(screen.getByText('<b>x</b>')).toBeInTheDocument();
    expect(document.querySelector('b')).toBeNull();
  });
});
