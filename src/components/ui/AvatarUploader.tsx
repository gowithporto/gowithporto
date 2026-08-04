"use client";

import { CameraIcon } from "@heroicons/react/24/solid";
import Image, { StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface AvatarUploaderProps {
  value?: string | null;
  fallback: StaticImageData;
  name?: string;
  onChange: (url: string) => void;
}

export default function AvatarUploader({
  value,
  fallback,
  name,
  onChange,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative h-28 w-28">
      <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-white shadow-md">
        <Image
          src={value || fallback}
          alt={name || "Profile photo"}
          width={112}
          height={112}
          className="h-full w-full object-cover"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#2c6e9b] text-white shadow-md transition hover:bg-[#2c6e9b]/90 disabled:opacity-60"
        aria-label="Change profile photo"
      >
        {uploading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <CameraIcon className="h-4 w-4" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}
