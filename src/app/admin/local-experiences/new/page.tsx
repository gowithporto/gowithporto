"use client";

import LocalExperienceForm, {
  LocalExperienceFormState,
} from "@/components/admin/LocalExperienceForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function NewLocalExperiencePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (form: LocalExperienceFormState) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/local-experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          coverImage: form.gallery[0] || "",
          price: form.price === "" ? undefined : Number(form.price),
          rating: form.rating === "" ? undefined : Number(form.rating),
          reviewCount:
            form.reviewCount === "" ? undefined : Number(form.reviewCount),
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create experience");
      }

      toast.success("Local experience created");
      router.push("/admin/local-experiences");
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
          Add Local Experience
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Add a new activity to the Local Experiences list.
        </p>
      </div>

      <LocalExperienceForm
        onSubmit={handleSubmit}
        submitting={saving}
        submitLabel="Create Experience"
      />
    </div>
  );
}
