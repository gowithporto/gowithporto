import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const LAST_UPDATED = "August 10, 2026";
const SUPPORT_EMAIL = "support@gowithporto.pt";

const SECTIONS = [
  { id: "who-we-are", title: "1. Who We Are" },
  { id: "information-we-collect", title: "2. Information We Collect" },
  { id: "how-we-use", title: "3. How We Use Your Information" },
  { id: "legal-basis", title: "4. Legal Basis for Processing" },
  { id: "cookies", title: "5. Cookies & Similar Technologies" },
  { id: "sharing", title: "6. Who We Share Data With" },
  { id: "transfers", title: "7. International Data Transfers" },
  { id: "retention", title: "8. Data Retention" },
  { id: "your-rights", title: "9. Your Rights" },
  { id: "children", title: "10. Children's Privacy" },
  { id: "security", title: "11. Data Security" },
  { id: "changes", title: "12. Changes to This Policy" },
  { id: "contact", title: "13. Contact Us" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-3">
      <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text)]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="space-y-12 px-4 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
          Privacy Policy
        </h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
        <p className="mt-5 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
        <p className="mt-3 text-[var(--text)]">
          This policy explains what personal data GoWithPorto collects, why, and the rights you
          have over it under the EU General Data Protection Regulation (GDPR).
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[240px_1fr]">
        {/* TABLE OF CONTENTS */}
        <nav className="hidden self-start rounded-2xl border border-black/5 bg-white/80 p-5 text-sm shadow-sm backdrop-blur lg:block lg:sticky lg:top-28">
          <p className="mb-3 font-serif text-sm font-medium text-[#1d3d5c]">On this page</p>
          <ul className="space-y-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[var(--text)] hover:text-[#2c6e9b]">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* CONTENT */}
        <div className="space-y-10 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
          <Section id="who-we-are" title="1. Who We Are">
            <p>
              GoWithPorto (&quot;GoWithPorto&quot;, &quot;we&quot;, &quot;us&quot;) is a Porto-based tourism platform that
              helps travelers plan trips, book bike rentals and local experiences, and shop
              souvenirs from independent local shops in Porto, Portugal. GoWithPorto is the data
              controller responsible for your personal data described in this policy.
            </p>
            <p>
              Questions about this policy or your data can be sent to{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#2c6e9b] underline hover:no-underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section id="information-we-collect" title="2. Information We Collect">
            <p>We collect the minimum data needed to run the service:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-[#1d3d5c]">Account data</span> — name, email
                address, and profile picture, provided by Google when you sign in with your
                Google account. We do not receive or store your Google password.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Order & booking data</span> —
                items purchased, shipping details, and order status for souvenirs, bike rentals,
                and local experiences.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Payment data</span> — handled
                entirely by our payment processor, Stripe. GoWithPorto never receives or stores
                your full card number.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">AI trip planner inputs</span> —
                the dates, interests, and preferences you enter to generate an itinerary, and
                the itineraries generated for you, saved under &quot;My Trips&quot; in your account.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Store owner content</span> — if you
                sell on our marketplace, product listings and images you upload.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Contact form messages</span> — the
                name, email, and message you submit through our Contact Support page.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Technical data</span> — IP address
                and basic request metadata, used briefly for security purposes such as
                rate-limiting login attempts.
              </li>
            </ul>
          </Section>

          <Section id="how-we-use" title="3. How We Use Your Information">
            <ul className="list-disc space-y-2 pl-5">
              <li>To create and manage your account and let you sign in securely.</li>
              <li>To process orders and bookings, and send confirmation and shipping emails.</li>
              <li>To generate AI trip itineraries based on the preferences you provide.</li>
              <li>To respond to messages sent through our Contact Support page.</li>
              <li>To detect and prevent fraud, abuse, and unauthorized access.</li>
              <li>To meet our legal and accounting obligations.</li>
            </ul>
            <p>We do not sell your personal data, and we do not use it for third-party advertising.</p>
          </Section>

          <Section id="legal-basis" title="4. Legal Basis for Processing">
            <p>Under the GDPR, we rely on the following legal bases:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-[#1d3d5c]">Contract</span> — processing needed
                to create your account, fulfil orders/bookings, and deliver AI itineraries you
                request.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Legitimate interest</span> —
                keeping the platform secure (e.g. rate-limiting), and responding to support
                requests.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Legal obligation</span> — retaining
                order and payment records as required by tax and accounting law.
              </li>
            </ul>
          </Section>

          <Section id="cookies" title="5. Cookies & Similar Technologies">
            <p>
              GoWithPorto uses a small number of strictly necessary cookies: a secure session
              cookie to keep you signed in, and a preference cookie to remember your chosen
              language. We do not use third-party advertising or tracking cookies.
            </p>
          </Section>

          <Section id="sharing" title="6. Who We Share Data With">
            <p>
              We only share personal data with service providers who process it on our behalf,
              strictly to run the service:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-[#1d3d5c]">Google</span> — for secure sign-in
                (Google OAuth).
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Stripe</span> — for payment
                processing at checkout.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">MongoDB Atlas</span> — our
                database provider, hosted in the EU (Paris, France region).
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Cloudinary</span> — for storing and
                serving product and profile images.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Resend</span> — for delivering
                transactional emails (order confirmations, receipts, welcome emails).
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Google Gemini API</span> — to
                generate AI trip itineraries from the preferences you provide.
              </li>
              <li>
                <span className="font-medium text-[#1d3d5c]">Vercel</span> — our application
                hosting provider.
              </li>
            </ul>
            <p>
              Each provider is contractually restricted to using your data only to provide their
              service to us. We may also disclose data where required by law.
            </p>
          </Section>

          <Section id="transfers" title="7. International Data Transfers">
            <p>
              Some of our service providers (such as Google, Stripe, and Resend) may process
              data outside the European Economic Area, including in the United States. Where
              this happens, we rely on providers that offer appropriate safeguards, such as
              Standard Contractual Clauses, to protect your data in line with GDPR requirements.
            </p>
          </Section>

          <Section id="retention" title="8. Data Retention">
            <p>
              We keep account data for as long as your account is active. Order and payment
              records are kept as required by Portuguese tax and accounting law. Contact form
              messages are kept only as long as needed to resolve your request. You can ask us
              to delete your account and associated data at any time — see Section 9.
            </p>
          </Section>

          <Section id="your-rights" title="9. Your Rights">
            <p>Under the GDPR, you have the right to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
              <li>Restrict or object to certain processing.</li>
              <li>Receive your data in a portable format.</li>
              <li>Withdraw consent at any time, where processing is based on consent.</li>
            </ul>
            <p>
              To exercise any of these rights, email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#2c6e9b] underline hover:no-underline">
                {SUPPORT_EMAIL}
              </a>
              . You also have the right to lodge a complaint with Portugal&apos;s data protection
              authority, the Comissão Nacional de Proteção de Dados (CNPD).
            </p>
          </Section>

          <Section id="children" title="10. Children's Privacy">
            <p>
              GoWithPorto is not directed at children, and we do not knowingly collect personal
              data from anyone under 16. If you believe a child has provided us with personal
              data, please contact us and we will delete it.
            </p>
          </Section>

          <Section id="security" title="11. Data Security">
            <p>
              We use industry-standard safeguards to protect your data, including encrypted
              connections (HTTPS), access-restricted databases, and secure authentication. No
              method of transmission or storage is 100% secure, but we work to protect your
              information using commercially reasonable measures.
            </p>
          </Section>

          <Section id="changes" title="12. Changes to This Policy">
            <p>
              We may update this policy from time to time as our service evolves. Material
              changes will be reflected by updating the &quot;Last updated&quot; date at the top of this
              page.
            </p>
          </Section>

          <Section id="contact" title="13. Contact Us">
            <p>
              For any questions about this Privacy Policy or how your data is handled, reach us
              at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#2c6e9b] underline hover:no-underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              or via our{" "}
              <Link href="/contact" className="font-medium text-[#2c6e9b] underline hover:no-underline">
                Contact Support
              </Link>{" "}
              page. We&apos;re based in Porto, Portugal.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
