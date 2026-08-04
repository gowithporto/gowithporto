"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface StoreType {
  _id: string;
  name: string;
  slug: string;
  storeCode: string;
  location: string;
  active: boolean;
  deliveryFee: number;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    location: "",
    storeCode: "",
    password: "",
    deliveryFee: 0,
  });

  const fetchStores = async () => {
    try {
      const res = await fetch("/api/admin/stores");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStores(data);
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create store");
      }

      toast.success("Store created successfully!");
      setShowForm(false);
      setFormData({
        name: "",
        slug: "",
        location: "",
        storeCode: "",
        password: "",
        deliveryFee: 0,
      });
      fetchStores();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage partner stores
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Store"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-primary/10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Register New Store
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Burger King"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Slug (URL Friendly)
                </label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="burger-king-downtown"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. 123 Main St"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Delivery Fee ($)
                </label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deliveryFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryFee: e.target.value === "" ? 0 : parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Store Code (Login ID)
                </label>
                <Input
                  required
                  value={formData.storeCode}
                  onChange={(e) =>
                    setFormData({ ...formData, storeCode: e.target.value })
                  }
                  placeholder="BK001"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            Loading stores...
          </p>
        ) : stores.length === 0 ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            No stores found. Create one to get started.
          </p>
        ) : (
          stores.map((store) => (
            <div
              key={store._id}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-transparent hover:border-black/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${store.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {store.active ? "Active" : "Inactive"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
              <p className="text-sm text-gray-500">@{store.slug}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {store.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  Delivery: ${store.deliveryFee}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <QrCodeIcon className="mr-2 h-4 w-4 text-gray-400" />
                  Code: {store.storeCode}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
