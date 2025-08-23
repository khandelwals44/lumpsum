import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "How we calculate, disclaimers, and trust details."
};

export default function AboutPage() {
  return (
    <div className="prose container-prose dark:prose-invert">
      <h1>About lumpsum.in</h1>
      <p>
        lumpsum.in provides accurate, transparent financial calculators for India. All computations
        run entirely in your browser—no personal data leaves your device.
      </p>
      <h2>How calculations are done</h2>
      <p>
        Formulas are implemented as pure TypeScript functions under <code>lib/calc</code>. Each
        calculator exposes both totals and time-series suitable for charts and CSV export.
      </p>
      <h2>Disclaimer</h2>
      <p>
        These tools are for education only and do not constitute investment advice. Returns are
        market dependent and not guaranteed. Consult a qualified advisor before making decisions.
      </p>
      <h2>Open source</h2>
      <p>Contributions are welcome. File issues, suggest improvements, or add new calculators.</p>
    </div>
  );
}
