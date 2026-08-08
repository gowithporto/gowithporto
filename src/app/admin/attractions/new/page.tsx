"use client";

import AttractionForm, {
  AttractionFormState,
} from "@/components/admin/AttractionForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function NewAttractionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (form: AttractionFormState) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/attractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          coverImage: form.gallery[0] || "",
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create attraction");
      }

      toast.success("Attraction created");
      router.push("/admin/attractions");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] dark:text-white">
          Add Attraction
        </h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Add a new place to the Top Attractions list.
        </p>
      </div>

      <AttractionForm
        onSubmit={handleSubmit}
        submitting={saving}
        submitLabel="Create Attraction"
      />
    </div>
  );
}
