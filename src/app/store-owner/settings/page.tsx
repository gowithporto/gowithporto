"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function StoreOwnerSettingsPage() {
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/store-owner/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentPin: pin }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update PIN");

      toast.success("Fulfillment PIN updated");
      setPin("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Manage account-level settings for your store.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            Fulfillment PIN
          </label>
          <Input
            type="text"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter a new PIN"
          />
          <p className="mt-1 text-xs text-black/40">
            Given to delivery/pickup staff to confirm handoffs — never your
            store&apos;s login code.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save PIN"}
          </Button>
        </div>
      </form>
    </div>
  );
}
