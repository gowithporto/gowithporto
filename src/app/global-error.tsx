"use client";

import Image from "next/image";
import { useEffect } from "react";

import Logo from "@/assets/GOWITHPORTO LOGO.png";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <Image src={Logo} alt="GoWithPorto" width={180} height={49} priority />

          <h1 className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] font-medium text-[#2c6e9b]">
            Something Went Wrong
          </h1>

          <p className="max-w-md text-[#2c6e9b]/80">
            The app hit an unexpected error. Give it another try — if it keeps
            happening, come back in a bit.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => reset()}
              className="cursor-pointer rounded-xl bg-[#2c6e9b] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              Try Again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- last-resort boundary, must not depend on the router */}
            <a
              href="/"
              className="cursor-pointer rounded-xl bg-[#AABBCC] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              Back to Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
