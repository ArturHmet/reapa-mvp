import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — REAPA",
  description: "REAPA Privacy Policy: how we collect, use, and protect your data. GDPR compliant. Malta.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-[var(--text-primary,#f1f5f9)] prose prose-invert prose-sm">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">
        Last updated: April 17, 2026 &nbsp;·&nbsp; Effective: April 17, 2026
      </p>

      {/* 1. Data Controller */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Data Controller</h2>
        <p>
          The data controller for REAPA (&quot;Service&quot;) is{" "}
          <strong>Artur Malokhmetov</strong>, operating as a sole trader in Malta.
        </p>
        <p className="mt-2">
          Contact:{" "}
          <a href="mailto:privacy@reapa.ai" className="text-indigo-400 underline">
            privacy@reapa.ai
          </a>
        </p>
      </section>

      {/* 2. What data we collect */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. What Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account data:</strong> Email address and full name when you register or
            join the beta waitlist.
          </li>
          <li>
            <strong>Usage data:</strong> Pages visited, features used, session timestamps,
            and IP address (via analytics tools).
          </li>
          <li>
            <strong>Conversation data:</strong> Messages you send to the REAPA AI Copilot.
            These are processed in real time to generate a response and are{" "}
            <strong>not stored on our servers</strong>.
          </li>
          <li>
            <strong>Lead &amp; client data:</strong> Contact details (name, phone, email) of
            real estate leads and clients that you voluntarily add to your REAPA dashboard.
            You are the controller of this data; we are the processor.
          </li>
          <li>
            <strong>Device &amp; browser data:</strong> Browser type, operating system,
            viewport size, and referrer URL (for UX optimisation).
          </li>
        </ul>
      </section>

      {/* 3. How we use your data */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Providing and improving the REAPA platform and AI features.</li>
          <li>Sending beta onboarding emails and important service notifications.</li>
          <li>Analysing aggregate usage patterns to improve product quality.</li>
          <li>Complying with AML regulations applicable to real estate professionals in Malta.</li>
        </ul>
        <p className="mt-3">
          <strong>Legal basis (GDPR Art. 6):</strong> Contract performance (Art. 6(1)(b))
          for core service delivery; Legitimate interest (Art. 6(1)(f)) for analytics and
          product improvement; Consent (Art. 6(1)(a)) for non-essential cookies and
          marketing communications.
        </p>
      </section>

      {/* 4. Sub-processors & data transfers */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Sub-processors &amp; International Transfers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 pr-4">Service</th>
                <th className="text-left py-2 pr-4">Purpose</th>
                <th className="text-left py-2">Data region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="py-2 pr-4 font-medium">Supabase (supabase.com)</td>
                <td className="py-2 pr-4">Database &amp; authentication</td>
                <td className="py-2 text-green-400">EU West 1 (Ireland) ✓</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Google Gemini API (Google LLC)</td>
                <td className="py-2 pr-4">AI response generation</td>
                <td className="py-2 text-yellow-400">USA — SCCs in place</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Vercel Inc.</td>
                <td className="py-2 pr-4">Application hosting</td>
                <td className="py-2">Global CDN / EU edge</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">PostHog (EU)</td>
                <td className="py-2 pr-4">Product analytics (with consent)</td>
                <td className="py-2 text-green-400">EU ✓</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          <strong>AI processing note:</strong> To provide AI Copilot features, your
          conversation messages are processed by the Google Gemini API (Google LLC, USA).
          No conversation history is stored server-side by REAPA. Google&apos;s standard
          contractual clauses (SCCs) govern this transfer under GDPR Chapter V.
        </p>
      </section>

      {/* 5. Cookies */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Cookies &amp; Tracking</h2>
        <p>We use two categories of cookies:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>Essential cookies:</strong> Authentication session tokens (Supabase Auth).
            These are required for the Service to function and do not require consent.
          </li>
          <li>
            <strong>Analytics cookies (PostHog):</strong> Page view and feature usage
            tracking. These are only activated after you accept our cookie banner.
          </li>
        </ul>
      </section>

      {/* 6. Data retention */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
        <p>
          Account data is retained for as long as your account exists. Waitlist email
          addresses are retained until the beta closes or until you request removal.
          Lead and client data you enter is retained until you delete it or close your
          account. Upon account deletion, all personal data is permanently erased within
          30 days.
        </p>
      </section>

      {/* 7. Your rights */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Your Rights (GDPR Chapter III)</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Access (Art. 15):</strong> Request a copy of all personal data we hold about you.</li>
          <li><strong>Rectification (Art. 16):</strong> Correct inaccurate personal data.</li>
          <li>
            <strong>Erasure — Right to be Forgotten (Art. 17):</strong> Delete your account
            and all associated data at any time via{" "}
            <Link href="/settings" className="text-indigo-400 underline">Settings → Delete Account</Link>.
          </li>
          <li><strong>Portability (Art. 20):</strong> Export your data in machine-readable format on request.</li>
          <li><strong>Restriction (Art. 18) &amp; Objection (Art. 21):</strong> Restrict or object to processing in certain circumstances.</li>
          <li>
            <strong>Lodge a complaint:</strong> You may lodge a complaint with the
            Information and Data Protection Commissioner (IDPC) in Malta:{" "}
            <a
              href="https://idpc.org.mt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline"
            >
              idpc.org.mt
            </a>
          </li>
        </ul>
        <p className="mt-3">
          To exercise any right, email{" "}
          <a href="mailto:privacy@reapa.ai" className="text-indigo-400 underline">
            privacy@reapa.ai
          </a>
          . We respond within 30 days.
        </p>
      </section>

      {/* 8. Security */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Security</h2>
        <p>
          We use industry-standard security measures: TLS 1.3 in transit, AES-256 at rest
          (Supabase), Row-Level Security (RLS) policies on all database tables, and
          rate limiting on all API endpoints. We perform regular security audits.
        </p>
      </section>

      {/* 9. Children */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
        <p>
          REAPA is not directed at persons under 18. We do not knowingly collect personal
          data from children.
        </p>
      </section>

      {/* 10. Changes */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
        <p>
          We may update this policy as the service evolves. Material changes will be
          notified by email. Continued use after the effective date constitutes acceptance.
        </p>
      </section>

      <hr className="border-gray-700 my-8" />
      <p className="text-xs text-gray-500">
        Governing law: Republic of Malta · GDPR (EU) 2016/679 applies.
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/terms" className="text-indigo-400 underline">Terms of Service</Link>
        <Link href="/" className="text-gray-400 hover:text-white">← Back to app</Link>
      </div>
    </div>
  );
}
