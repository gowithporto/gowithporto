"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { RootState } from "@/store";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";

import { FaOpencart } from "react-icons/fa";
import Logo from "../../assets/GOWITHPORTO LOGO.png";
import TopLeftLine from "../../assets/top left line 1.png";
import TopRightLine from "../../assets/top right line 1.png";

export default function Header() {
  const { data: session } = useSession();
  const isStoreOwner = session?.user?.role === "STORE_OWNER";

  const { lang, setLang } = useLanguage();

  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  if (session?.user?.role === "ADMIN") return null;

  return (
    <header className="absolute top-0 left-0 z-50 w-full">
      <div className="relative flex items-center justify-between">
        {/* Left Azulejo */}
        <Image
          src={TopLeftLine}
          alt=""
          width={260}
          height={60}
          className="hidden lg:block"
        />

        {/* Center Nav */}
        <nav className="grid w-full grid-cols-3 items-center">
          {/* LEFT — Theme + Language */}
          <div className="flex items-center gap-3 pl-6 mt-20 sm:mt-0">
            {/* Theme */}
            <ThemeToggle />

            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="rounded-xs border border-[#2c6e9b]/30 px-2 py-1 text-sm text-[#2c6e9b] cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="pt">PT</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="de">DE</option>
            </select>
          </div>

          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/">
              <Image
                src={Logo}
                alt="GoWithPorto"
                width={220}
                height={60}
                priority
              />
            </Link>
          </div>

          {/* Right Links */}
          <div className="flex items-center justify-end gap-6 pr-6 text-sm text-[var(--text)] mt-20 sm:mt-0">
            <Link className="hover:text-[#eab657]/80" href="/shop">
              {t(lang, "nav.shop")}
            </Link>

            {session && !isStoreOwner && (
              <>
                <Link className="hover:text-[#eab657]/80" href="/cart">
                  <FaOpencart className="inline-block" />
                  {t(lang, "nav.cart")}
                  {cartCount > 0 && `(${cartCount})`}
                </Link>
                <Link className="hover:text-[#eab657]/80" href="/ai">
                  {t(lang, "nav.ai")}
                </Link>
              </>
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
                className="rounded-full bg-[#2c6e9b] px-5 py-2 text-white hover:bg-[#2c6e9b]/90 cursor-pointer"
              >
                {t(lang, "nav.logout")}
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="rounded-full bg-[#2c6e9b] px-5 py-2 text-white hover:bg-[#2c6e9b]/90 cursor-pointer"
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
