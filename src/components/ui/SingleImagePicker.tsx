"use client";

import ImageUploader from "./ImageUploader";

export default function SingleImagePicker({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  return (
    <ImageUploader
      value={value ? [value] : []}
      onChange={(urls) => onChange(urls[urls.length - 1] || "")}
      folder={folder}
    />
  );
}
