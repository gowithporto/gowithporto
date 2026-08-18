"use client";

import { locales, t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { RootState } from "@/store";
import {
  Bars3Icon,
  LanguageIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { FaOpencart } from "react-icons/fa";
import Logo from "../../assets/GOWITHPORTO LOGO.png";
import TopLeftLine from "../../assets/top left line 1.png";
import TopRightLine from "../../assets/top right line 1.png";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
];

function LanguageMenu({
  lang,
  switchLanguage,
  align,
}: {
  lang: string;
  switchLanguage: (code: string) => void;
  align: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#2c6e9b]/30 text-[#2c6e9b] transition hover:bg-[#2c6e9b]/10"
      >
        <LanguageIcon className="h-4.5 w-4.5" />
      </button>

      {open && (
        <div
          className={`absolute top-10 z-30 w-40 rounded-xl border border-black/5 bg-white p-1.5 shadow-lg ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                switchLanguage(option.code);
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[#2c6e9b]/10 ${
                lang === option.code ? "font-semibold text-[#2c6e9b]" : "text-[var(--text)]"
              }`}
            >
              {option.label}
              {lang === option.code && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { data: session } = useSession();
  const isStoreOwner = session?.user?.role === "STORE_OWNER";

  const { lang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // NextAuth redirects auth failures back to "/" with ?error=... (see pages.error
  // in lib/auth.ts) instead of its own default page. Surface it as a toast, then
  // strip the param so it doesn't refire on refresh.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("error")) return;

    toast.error(t(lang, "auth.signinError"));
    params.delete("error");
    const query = params.toString();
    router.replace(window.location.pathname + (query ? `?${query}` : ""), {
      scroll: false,
    });
  }, [lang, router]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  if (session?.user?.role === "ADMIN") return null;

  const switchLanguage = (nextLang: string) => {
    const segments = pathname.split("/");
    const hasPrefix = (locales as readonly string[]).includes(segments[1]);
    const rest = hasPrefix ? "/" + segments.slice(2).join("/") : pathname;
    const cleanRest = rest === "/" ? "" : rest;
    router.push(nextLang === "en" ? cleanRest || "/" : `/${nextLang}${cleanRest}`);
  };

  return (
    <header className="absolute top-0 left-0 z-50 w-full">
      {/* Mobile top bar — fixed so it stays visible on every page, even mid-scroll */}
      <div
        className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur-lg lg:hidden"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        {/* Top Azulejo — smaller, decorative, behind the hamburger/logo */}
        <Image
          src={TopLeftLine}
          alt=""
          width={260}
          height={60}
          className="pointer-events-none absolute top-0 left-0 z-0 h-auto w-20 opacity-60 sm:w-28"
        />
        <Image
          src={TopRightLine}
          alt=""
          width={260}
          height={60}
          className="pointer-events-none absolute top-0 right-0 z-0 h-auto w-20 opacity-60 sm:w-28"
        />

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          className="relative z-10 flex h-9 w-9 cursor-pointer items-center justify-center text-[#2c6e9b]"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <Link href="/" className="relative z-10">
          <Image src={Logo} alt="GoWithPorto" width={150} height={41} priority />
        </Link>

        <div className="relative z-10 flex items-center gap-2">
          <LanguageMenu lang={lang} switchLanguage={switchLanguage} align="right" />

          {session && !isStoreOwner && (
            <Link
              href="/cart"
              aria-label={t(lang, "nav.cart")}
              className="relative flex h-8 w-8 items-center justify-center text-[#2c6e9b]"
            >
              <FaOpencart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#eab657] text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 z-50 flex h-full w-72 max-w-[80vw] flex-col overflow-y-auto bg-white p-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="mb-4 flex h-9 w-9 cursor-pointer items-center justify-center self-end text-[#2c6e9b]"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="mb-4 flex items-center gap-2 border-b border-black/10 pb-4">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => switchLanguage(option.code)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                    lang === option.code
                      ? "border-[#2c6e9b] bg-[#2c6e9b] text-white"
                      : "border-[#2c6e9b]/30 text-[#2c6e9b]"
                  }`}
                >
                  {option.code.toUpperCase()}
                </button>
              ))}
            </div>

            <nav className="flex flex-col text-[var(--text)]">
              <Link
                href="/shop"
                onClick={closeMobileMenu}
                className="border-b border-black/5 py-3 text-sm font-medium"
              >
                {t(lang, "nav.shop")}
              </Link>

              {session && !isStoreOwner && (
                <>
                  <Link
                    href="/ai"
                    onClick={closeMobileMenu}
                    className="border-b border-black/5 py-3 text-sm font-medium"
                  >
                    {t(lang, "nav.ai")}
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between border-b border-black/5 py-3 text-sm font-medium"
                  >
                    {t(lang, "nav.cart")}
                    {cartCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eab657] text-[11px] font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {session?.user?.role === "USER" && (
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="border-b border-black/5 py-3 text-sm font-medium"
                >
                  {t(lang, "nav.dashboard")}
                </Link>
              )}

              {session?.user?.role === "STORE_OWNER" && (
                <Link
                  href="/store-owner"
                  onClick={closeMobileMenu}
                  className="border-b border-black/5 py-3 text-sm font-medium"
                >
                  {t(lang, "nav.store-dashboard")}
                </Link>
              )}

              <div className="pt-5">
                {session ? (
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      signOut();
                    }}
                    className="w-full cursor-pointer rounded-full bg-[#2c6e9b] px-4 py-2.5 font-semibold text-white hover:bg-[#2c6e9b]/90"
                  >
                    {t(lang, "nav.logout")}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      signIn("google");
                    }}
                    className="w-full cursor-pointer rounded-full bg-[#2c6e9b] px-4 py-2.5 font-semibold text-white hover:bg-[#2c6e9b]/90"
                  >
                    {t(lang, "nav.login")}
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop bar */}
      <div className="relative hidden items-center justify-between lg:flex">
        {/* Left Azulejo */}
        <Image
          src={TopLeftLine}
          alt=""
          width={260}
          height={60}
          className="hidden lg:block"
        />

        {/* Center Nav */}
        <nav className="relative flex w-full min-h-15 items-center justify-between">
          {/* LEFT — Language + AI Planner */}
          <div className="flex items-center gap-4 pl-6 mt-20 sm:mt-0 text-sm font-medium whitespace-nowrap text-[var(--text)]">
            <LanguageMenu lang={lang} switchLanguage={switchLanguage} align="left" />

            {session && !isStoreOwner && (
              <Link className="hover:text-[#eab657]/80" href="/ai">
                {t(lang, "nav.ai")}
              </Link>
            )}
          </div>

          {/* Logo — absolutely centered so it never shifts with left/right content width */}
          <Link
            href="/"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src={Logo}
              alt="GoWithPorto"
              width={220}
              height={60}
              priority
            />
          </Link>

          {/* Right Links */}
          <div className="flex items-center justify-end gap-4 pr-6 text-sm font-medium whitespace-nowrap text-[var(--text)] mt-20 sm:mt-0">
            <Link className="hover:text-[#eab657]/80" href="/shop">
              {t(lang, "nav.shop")}
            </Link>

            {session && !isStoreOwner && (
              <Link
                href="/cart"
                aria-label={t(lang, "nav.cart")}
                className="relative flex items-center hover:text-[#eab657]/80"
              >
                <FaOpencart className="h-4.5 w-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#eab657] text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {session?.user?.role === "USER" && (
              <Link className="hover:text-[#eab657]/80" href="/dashboard">
                {t(lang, "nav.dashboard")}
              </Link>
            )}

            {session?.user?.role === "STORE_OWNER" && (
              <Link className="hover:text-[#eab657]/80" href="/store-owner">
                {t(lang, "nav.store-dashboard")}
              </Link>
            )}

            {session ? (
              <button
                onClick={() => signOut()}
                className="rounded-full bg-[#2c6e9b] px-4 py-2 font-semibold text-white hover:bg-[#2c6e9b]/90 cursor-pointer"
              >
                {t(lang, "nav.logout")}
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="rounded-full bg-[#2c6e9b] px-4 py-2 font-semibold text-white hover:bg-[#2c6e9b]/90 cursor-pointer"
              >
                {t(lang, "nav.login")}
              </button>
            )}
          </div>
        </nav>

        {/* Right Azulejo */}
        <Image
          src={TopRightLine}
          alt=""
          width={260}
          height={60}
          className="hidden lg:block"
        />
      </div>
    </header>
  );
}
