'use client';

/** Opens the browser's print dialog, where "Save as PDF" is one option. */
export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="btn btn-primary print:hidden"
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
