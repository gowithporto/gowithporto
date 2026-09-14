import Link from "@/components/ui/LocalizedLink";

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
      className="group relative block h-72 w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition hover:shadow-lg"
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      )}

      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 30%, transparent 70%)",
          maskImage:
            "linear-gradient(to top, black 0%, black 30%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 30%, transparent 70%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-4">
        <h3 className="font-semibold text-white drop-shadow-sm">{name}</h3>
        <p className="text-xs text-white/80">
          {count} {count === 1 ? "product" : "products"}
        </p>
      </div>
    </Link>
  );
}
