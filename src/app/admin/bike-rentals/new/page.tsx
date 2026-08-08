"use client";

import BikeRentalProviderForm from "@/components/admin/BikeRentalProviderForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function NewBikeRentalProviderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (form: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bike-rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create provider");
      }

      toast.success("Bike rental provider created");
      router.push("/admin/bike-rentals");
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
          Add Bike Rental Provider
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Add a new bike rental shop to promote to visitors.
        </p>
      </div>

      <BikeRentalProviderForm
        onSubmit={handleSubmit}
        submitting={saving}
        submitLabel="Create Provider"
      />
    </div>
  );
}
