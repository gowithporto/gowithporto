import Link from "next/link";

type Props = {
  name: string;
  slug: string;
  count: number;
  thumbnail?: string;
};

export default function CategoryCard({ name, slug, count, thumbnail }: Props) {
  return (
    <Link
      href={`/shop/category/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        {thumbnail && (
          <img
            src={thumbnail}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="font-semibold text-[var(--text)]">{name}</h3>
        <p className="text-xs text-gray-500">
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>
    </Link>
  );
}
