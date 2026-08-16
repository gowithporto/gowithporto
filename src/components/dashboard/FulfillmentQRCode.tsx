"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

export default function FulfillmentQRCode({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(`${BASE_URL}/fulfill/${token}`, { width: 240, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-[#173d5c]">
            Confirmation Code
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-black/40 transition hover:bg-black/5"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Confirmation QR code"
            className="mx-auto h-56 w-56"
          />
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-gray-400">
            Generating code...
          </div>
        )}

        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-700">
          Only show this once you have the item in your hands — sharing it
          confirms you&apos;ve received your order and releases payment to the seller.
        </p>
      </div>
    </div>
  );
}
