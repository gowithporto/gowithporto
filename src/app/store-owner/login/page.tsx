"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function StoreOwnerLoginPage() {
  const [storeCode, setStoreCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("store-owner-login", {
      storeCode,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid store code or password");
    } else {
      window.location.href = "/store-owner";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded border p-6"
      >
        <h1 className="text-xl font-semibold">Store Owner Login</h1>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Store Code"
          value={storeCode}
          onChange={(e) => setStoreCode(e.target.value)}
          required
        />

        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full rounded bg-[#2c6e9b] py-2 text-white hover:bg-[#2c6e9b]/90"
        >
          Login
        </button>
      </form>
    </div>
  );
}
