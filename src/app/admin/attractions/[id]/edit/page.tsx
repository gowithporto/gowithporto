"use client";

import AttractionForm, {
  AttractionFormState,
} from "@/components/admin/AttractionForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function EditAttractionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [attraction, setAttraction] = useState<AttractionFormState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/attractions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setAttraction(data))
      .catch(() => setNotFound(true));
  }, [id]);

  const handleSubmit = async (form: AttractionFormState) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/attractions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          coverImage: form.gallery[0] || "",
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update attraction");
      }

      toast.success("Attraction updated");
      router.push("/admin/attractions");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return <p className="text-sm text-red-500">Attraction not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] dark:text-white">
          Edit Attraction
        </h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Update this attraction&apos;s details.
        </p>
      </div>

      {attraction && (
        <AttractionForm
          initial={attraction}
          onSubmit={handleSubmit}
          submitting={saving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
}
