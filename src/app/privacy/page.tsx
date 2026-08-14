import { t } from "@/i18n";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { headers } from "next/headers";
import Link from "@/components/ui/LocalizedLink";

const LAST_UPDATED = "August 10, 2026";
const SUPPORT_EMAIL = "support@gowithporto.pt";

const SECTION_IDS = [
  "who-we-are",
  "information-we-collect",
  "how-we-use",
  "legal-basis",
  "cookies",
  "sharing",
  "transfers",
  "retention",
  "your-rights",
  "children",
  "security",
  "changes",
  "contact",
] as const;

const SECTION_TITLE_KEYS: Record<(typeof SECTION_IDS)[number], string> = {
  "who-we-are": "privacy.section.whoWeAre.title",
  "information-we-collect": "privacy.section.collect.title",
  "how-we-use": "privacy.section.howWeUse.title",
  "legal-basis": "privacy.section.legalBasis.title",
  cookies: "privacy.section.cookies.title",
  sharing: "privacy.section.sharing.title",
  transfers: "privacy.section.transfers.title",
  retention: "privacy.section.retention.title",
  "your-rights": "privacy.section.yourRights.title",
  children: "privacy.section.children.title",
  security: "privacy.section.security.title",
  changes: "privacy.section.changes.title",
  contact: "privacy.section.contactUs.title",
};

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

const SHARING_PROVIDERS = ["google", "stripe", "mongodb", "cloudinary", "resend", "gemini", "vercel"] as const;

export default async function PrivacyPage() {
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";

  return (
    <div className="space-y-12 px-4 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
          {t(lang, "privacy.title")}
        </h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
        <p className="mt-5 text-sm text-gray-500">
          {t(lang, "privacy.lastUpdatedLabel")} {LAST_UPDATED}
        </p>
        <p className="mt-3 text-[var(--text)]">{t(lang, "privacy.subtitle")}</p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[240px_1fr]">
        {/* TABLE OF CONTENTS */}
        <nav className="hidden self-start rounded-2xl border border-black/5 bg-white/80 p-5 text-sm shadow-sm backdrop-blur lg:block lg:sticky lg:top-28">
          <p className="mb-3 font-serif text-sm font-medium text-[#1d3d5c]">
            {t(lang, "privacy.tocHeading")}
          </p>
          <ul className="space-y-2">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="text-[var(--text)] hover:text-[#2c6e9b]">
                  {t(lang, SECTION_TITLE_KEYS[id])}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* CONTENT */}
        <div className="space-y-10 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
          <Section id="who-we-are" title={t(lang, "privacy.section.whoWeAre.title")}>
            <p>{t(lang, "privacy.section.whoWeAre.p1")}</p>
            <p>
              {t(lang, "privacy.section.whoWeAre.contactPrefix")}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#2c6e9b] underline hover:no-underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section id="information-we-collect" title={t(lang, "privacy.section.collect.title")}>
            <p>{t(lang, "privacy.section.collect.intro")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {(["account", "orders", "payment", "aiInputs", "storeContent", "contactForm", "technical"] as const).map(
                (item) => (
                  <li key={item}>
                    <span className="font-medium text-[#1d3d5c]">
                      {t(lang, `privacy.section.collect.item.${item}.label`)}
                    </span>{" "}
                    {t(lang, `privacy.section.collect.item.${item}.text`)}
                  </li>
                ),
              )}
            </ul>
          </Section>

          <Section id="how-we-use" title={t(lang, "privacy.section.howWeUse.title")}>
            <ul className="list-disc space-y-2 pl-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <li key={n}>{t(lang, `privacy.section.howWeUse.item${n}`)}</li>
              ))}
            </ul>
            <p>{t(lang, "privacy.section.howWeUse.noSell")}</p>
          </Section>

          <Section id="legal-basis" title={t(lang, "privacy.section.legalBasis.title")}>
            <p>{t(lang, "privacy.section.legalBasis.intro")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {(["contract", "legitimateInterest", "legalObligation"] as const).map((item) => (
                <li key={item}>
                  <span className="font-medium text-[#1d3d5c]">
                    {t(lang, `privacy.section.legalBasis.item.${item}.label`)}
                  </span>{" "}
                  {t(lang, `privacy.section.legalBasis.item.${item}.text`)}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="cookies" title={t(lang, "privacy.section.cookies.title")}>
            <p>{t(lang, "privacy.section.cookies.p1")}</p>
          </Section>

          <Section id="sharing" title={t(lang, "privacy.section.sharing.title")}>
            <p>{t(lang, "privacy.section.sharing.intro")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {SHARING_PROVIDERS.map((item) => (
                <li key={item}>
                  <span className="font-medium text-[#1d3d5c]">
                    {t(lang, `privacy.section.sharing.item.${item}.label`)}
                  </span>{" "}
                  {t(lang, `privacy.section.sharing.item.${item}.text`)}
                </li>
              ))}
            </ul>
            <p>{t(lang, "privacy.section.sharing.outro")}</p>
          </Section>

          <Section id="transfers" title={t(lang, "privacy.section.transfers.title")}>
            <p>{t(lang, "privacy.section.transfers.p1")}</p>
          </Section>

          <Section id="retention" title={t(lang, "privacy.section.retention.title")}>
            <p>{t(lang, "privacy.section.retention.p1")}</p>
          </Section>

          <Section id="your-rights" title={t(lang, "privacy.section.yourRights.title")}>
            <p>{t(lang, "privacy.section.yourRights.intro")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <li key={n}>{t(lang, `privacy.section.yourRights.item${n}`)}</li>
              ))}
            </ul>
            <p>
              {t(lang, "privacy.section.yourRights.exercisePrefix")}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#2c6e9b] underline hover:no-underline">
                {SUPPORT_EMAIL}
              </a>
              {t(lang, "privacy.section.yourRights.complaintSuffix")}
            </p>
          </Section>

          <Section id="children" title={t(lang, "privacy.section.children.title")}>
            <p>{t(lang, "privacy.section.children.p1")}</p>
          </Section>

          <Section id="security" title={t(lang, "privacy.section.security.title")}>
            <p>{t(lang, "privacy.section.security.p1")}</p>
          </Section>

          <Section id="changes" title={t(lang, "privacy.section.changes.title")}>
            <p>{t(lang, "privacy.section.changes.p1")}</p>
          </Section>

          <Section id="contact" title={t(lang, "privacy.section.contactUs.title")}>
            <p>
              {t(lang, "privacy.section.contactUs.prefix")}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#2c6e9b] underline hover:no-underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              {t(lang, "privacy.section.contactUs.middle")}{" "}
              <Link href="/contact" className="font-medium text-[#2c6e9b] underline hover:no-underline">
                {t(lang, "privacy.section.contactUs.linkText")}
              </Link>{" "}
              {t(lang, "privacy.section.contactUs.suffix")}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
