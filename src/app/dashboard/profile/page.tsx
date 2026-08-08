"use client";

import AvatarUploader from "@/components/ui/AvatarUploader";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import defaultAvatar from "@/assets/6. user dashboard page/profile.png";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || null);
    }
  }, [session?.user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save changes");
      }

      await update({ user: { name, image } });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#173d5c] sm:text-4xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Update your photo and how your name appears across GoWithPorto.
        </p>
      </div>

      <form
        onSubmit={save}
        className="max-w-lg space-y-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-5">
          <AvatarUploader
            value={image}
            fallback={defaultAvatar}
            name={name}
            onChange={(url) => setImage(url)}
          />
          <div>
            <p className="text-sm font-medium text-[var(--text)]">
              Profile photo
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Click the camera icon to upload a new photo.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--text)]">
            <UserIcon className="h-4 w-4 text-gray-400" />
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--text)]">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            Email
          </label>
          <input
            type="email"
            value={session?.user?.email || ""}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-2.5 text-sm text-gray-500 outline-none"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Your email is tied to your sign-in and can&apos;t be changed here.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#1d3d5c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3d5c]/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
