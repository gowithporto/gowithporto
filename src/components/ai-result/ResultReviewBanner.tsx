import { FaStar } from "react-icons/fa";

const avatars = [
  { initials: "M", bg: "#2c6e9b" },
  { initials: "J", bg: "#eab657" },
  { initials: "S", bg: "#4d8fc7" },
];

export default function ResultReviewBanner() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/5 bg-[#f4f7fa] p-6 sm:flex-row sm:p-8">
      <div className="flex -space-x-3">
        {avatars.map((a) => (
          <div
            key={a.initials}
            style={{ backgroundColor: a.bg }}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f4f7fa] text-sm font-semibold text-white"
          >
            {a.initials}
          </div>
        ))}
      </div>

      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <span className="text-sm font-semibold text-[var(--text)]">
            Loved by Travelers
          </span>
          <span className="flex text-[#eab657]">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </span>
          <span className="font-serif text-[var(--primary)]">4.9/5</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Join 1,000+ travelers who&apos;ve planned their perfect Porto trip
          with AI
        </p>
        <span className="mt-1 inline-block cursor-default text-xs font-medium text-[#2c6e9b]">
          Read reviews on Trustpilot →
        </span>
      </div>
    </div>
  );
}
