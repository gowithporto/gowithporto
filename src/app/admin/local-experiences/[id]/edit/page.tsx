"use client";

import LocalExperienceForm, {
  LocalExperienceFormState,
} from "@/components/admin/LocalExperienceForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function toFormState(data: any): Partial<LocalExperienceFormState> {
  return {
    ...data,
    price: data.price === undefined || data.price === null ? "" : String(data.price),
    rating:
      data.rating === undefined || data.rating === null ? "" : String(data.rating),
    reviewCount:
      data.reviewCount === undefined || data.reviewCount === null
        ? ""
        : String(data.reviewCount),
  };
}

export default function EditLocalExperiencePage() {
  const { id } = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<Partial<LocalExperienceFormState> | null>(
    null,
  );
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/local-experiences/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setExperience(toFormState(data)))
      .catch(() => setNotFound(true));
  }, [id]);

  const handleSubmit = async (form: LocalExperienceFormState) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/local-experiences/${id}`, {
        method: "PUT",
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
        throw new Error(error.error || "Failed to update experience");
      }

      toast.success("Local experience updated");
      router.push("/admin/local-experiences");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return <p className="text-sm text-red-500">Local experience not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] dark:text-white">
          Edit Local Experience
        </h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Update this experience&apos;s details.
        </p>
      </div>

      {experience && (
        <LocalExperienceForm
          initial={experience}
          onSubmit={handleSubmit}
          submitting={saving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
}
