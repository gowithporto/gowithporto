"use client";

import BikeRentalProviderForm from "@/components/admin/BikeRentalProviderForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function EditBikeRentalProviderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/bike-rentals/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setProvider(data))
      .catch(() => setNotFound(true));
  }, [id]);

  const handleSubmit = async (form: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bike-rentals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update provider");
      }

      toast.success("Bike rental provider updated");
      router.push("/admin/bike-rentals");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return <p className="text-sm text-red-500">Bike rental provider not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c]">
          Edit Bike Rental Provider
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Update this shop&apos;s details.
        </p>
      </div>

      {provider && (
        <BikeRentalProviderForm
          initial={provider}
          onSubmit={handleSubmit}
          submitting={saving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
}
