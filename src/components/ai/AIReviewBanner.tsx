import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const avatars = [
  { initials: "M", bg: "#2c6e9b" },
  { initials: "J", bg: "#eab657" },
  { initials: "S", bg: "#4d8fc7" },
];

export default function AIReviewBanner() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-black/5 bg-[#f4f7fa] p-6 sm:flex-row sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {avatars.map((a) => (
              <div
                key={a.initials}
                style={{ backgroundColor: a.bg }}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f4f7fa] text-sm font-semibold text-white"
              >
                {a.initials}
              </div>
            ))}
          </div>
          <p className="max-w-xs text-sm text-[var(--text)]">
            Join 1,000+ travelers who&apos;ve planned their perfect Porto trip
            with AI
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 sm:items-end">
          <div className="flex items-center gap-3">
            <div className="flex text-[#eab657]">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStarHalfAlt />
            </div>
            <span className="font-serif text-lg text-[var(--primary)]">
              4.9/5
            </span>
          </div>
          <p className="text-xs text-gray-400">based on 500+ reviews</p>
        </div>
      </div>
    </div>
  );
}
