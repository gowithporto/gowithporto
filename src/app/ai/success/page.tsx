"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    async function finalizeCredits() {
      if (!sessionId) {
        console.error("No sessionId found in URL query parameters");
        return;
      }

      try {
        console.log("Finalizing credits for session:", sessionId);
        const res = await fetch("/api/user/credits/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Failed to finalize credits:", errorData);
          toast.error("Error finalizing credits. Please contact support.");
        } else {
          console.log("Credits finalized successfully");
        }
      } catch (err) {
        console.error("Network error finalizing credits:", err);
      } finally {
        // Redirect to AI result page
        router.replace("/ai");
      }
    }

    finalizeCredits();
  }, [router, sessionId]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">Finalizing your AI credits…</p>
    </div>
  );
}

export default function AISuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
