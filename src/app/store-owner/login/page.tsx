"use client";

import {
  ArrowRightIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

import HeroBg from "@/assets/1. home page/Hero banner.png";
import Divider from "@/assets/line top center.png";

export default function StoreOwnerLoginPage() {
  const [storeCode, setStoreCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("store-owner-login", {
      storeCode,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error("Invalid store code or password");
    } else {
      window.location.href = "/store-owner";
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 pt-32 pb-16">
      {/* Background scene */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-full md:w-[65%]">
          <Image
            src={HeroBg}
            alt=""
            fill
            priority
            className="object-cover object-right opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white" />
        </div>
        {/* Subtle azulejo wash on the right */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #2c6e9b 0, #2c6e9b 1px, transparent 1px, transparent 26px), repeating-linear-gradient(-45deg, #2c6e9b 0, #2c6e9b 1px, transparent 1px, transparent 26px)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2c6e9b]/10">
            <BuildingStorefrontIcon className="h-8 w-8 text-[#2c6e9b]" />
          </div>

          <h1 className="mt-4 text-center font-serif text-2xl font-semibold text-[#1d3d5c]">
            Store Owner Login
          </h1>

          <Image
            src={Divider}
            alt=""
            className="mx-auto my-4 h-4 w-auto opacity-80"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 bg-white transition focus-within:border-[#2c6e9b] focus-within:ring-2 focus-within:ring-[#2c6e9b]/20">
              <span className="flex items-center justify-center border-r border-black/10 bg-black/[0.02] px-3 text-[#2c6e9b]">
                <UserIcon className="h-5 w-5" />
              </span>
              <input
                className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-black/40"
                placeholder="Store Code"
                value={storeCode}
                onChange={(e) => setStoreCode(e.target.value)}
                required
              />
            </div>

            <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 bg-white transition focus-within:border-[#2c6e9b] focus-within:ring-2 focus-within:ring-[#2c6e9b]/20">
              <span className="flex items-center justify-center border-r border-black/10 bg-black/[0.02] px-3 text-[#2c6e9b]">
                <LockClosedIcon className="h-5 w-5" />
              </span>
              <input
                className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-black/40"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center justify-center px-3 text-black/40 hover:text-[#2c6e9b]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2c6e9b] py-3 font-semibold text-white transition hover:bg-[#2c6e9b]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
              {!loading && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-black/40">or</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#2c6e9b]">
            <ShieldCheckIcon className="h-5 w-5" />
            Secure Store Access
          </div>
          <p className="mt-1 text-center text-xs text-black/40">
            Authorized store owners only
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-full bg-white/80 px-6 py-3 text-xs text-[#1d3d5c] shadow-md backdrop-blur-sm sm:gap-6 sm:text-sm">
          <span className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-[#2c6e9b]" />
            Authorized by Câmara Municipal do Porto
          </span>
          <span className="hidden h-4 w-px bg-black/10 sm:block" />
          <span className="flex items-center gap-2">
            <LockClosedIcon className="h-4 w-4 text-[#2c6e9b]" />
            Your data is safe with us
          </span>
        </div>
      </div>
    </div>
  );
}
