"use client";

import {
  ArrowRightIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import HeroBg from "@/assets/1. home page/Hero banner.png";
import Divider from "@/assets/line top center.png";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("admin-login", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error("Invalid credentials or unauthorized access");
      } else {
        toast.success("Welcome back, Admin");
        router.push("/admin");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 pt-32 pb-16 dark:bg-[#0b1219]">
      {/* Background scene */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-full md:w-[65%]">
          <Image
            src={HeroBg}
            alt=""
            fill
            priority
            className="object-cover object-right opacity-90 dark:opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white dark:from-transparent dark:via-transparent dark:to-[#0b1219]" />
        </div>
        {/* Subtle azulejo wash on the right */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #2c6e9b 0, #2c6e9b 1px, transparent 1px, transparent 26px), repeating-linear-gradient(-45deg, #2c6e9b 0, #2c6e9b 1px, transparent 1px, transparent 26px)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10 dark:border-white/10 dark:bg-[#111c27]/95">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1d3d5c]/10">
            <ShieldCheckIcon className="h-8 w-8 text-[#1d3d5c] dark:text-[#5aa6d6]" />
          </div>

          <h1 className="mt-4 text-center font-serif text-2xl font-bold text-[#1d3d5c] dark:text-white">
            Admin Portal
          </h1>
          <p className="mt-1 text-center text-sm text-black/40 dark:text-white/40">
            Sign in to access the dashboard
          </p>

          <Image
            src={Divider}
            alt=""
            className="mx-auto my-4 h-4 w-auto opacity-80"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 bg-white transition focus-within:border-[#2c6e9b] focus-within:ring-2 focus-within:ring-[#2c6e9b]/20 dark:border-white/15 dark:bg-white/5">
              <span className="flex items-center justify-center border-r border-black/10 bg-black/[0.02] px-3 text-[#2c6e9b] dark:border-white/10 dark:bg-white/5">
                <EnvelopeIcon className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="flex items-stretch overflow-hidden rounded-xl border border-black/10 bg-white transition focus-within:border-[#2c6e9b] focus-within:ring-2 focus-within:ring-[#2c6e9b]/20 dark:border-white/15 dark:bg-white/5">
              <span className="flex items-center justify-center border-r border-black/10 bg-black/[0.02] px-3 text-[#2c6e9b] dark:border-white/10 dark:bg-white/5">
                <LockClosedIcon className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="flex items-center justify-center px-3 text-black/40 hover:text-[#2c6e9b] dark:text-white/40 dark:hover:text-white"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d3d5c] py-3 font-semibold text-white transition hover:bg-[#1d3d5c]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <span className="text-xs text-black/40 dark:text-white/40">or</span>
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#1d3d5c] dark:text-[#5aa6d6]">
            <ShieldCheckIcon className="h-5 w-5" />
            Administrator Access
          </div>
          <p className="mt-1 text-center text-xs text-black/40 dark:text-white/40">
            Restricted to authorized administrators only
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-full bg-white/80 px-6 py-3 text-xs text-[#1d3d5c] shadow-md backdrop-blur-sm sm:gap-6 sm:text-sm dark:bg-white/5 dark:text-white/70">
          <span className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-[#2c6e9b] dark:text-[#5aa6d6]" />
            Authorized by Câmara Municipal do Porto
          </span>
          <span className="hidden h-4 w-px bg-black/10 sm:block dark:bg-white/10" />
          <span className="flex items-center gap-2">
            <LockClosedIcon className="h-4 w-4 text-[#2c6e9b] dark:text-[#5aa6d6]" />
            Your data is safe with us
          </span>
        </div>
      </div>
    </div>
  );
}
