import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatTHB, type CatalogProduct } from "@/lib/catalog";

export function ProductCard({
  product,
  compact = false,
}: {
  product: CatalogProduct;
  compact?: boolean;
}) {
  const variant = product.variants[0];
  return (
    <article className="group rounded-xl border border-line bg-white p-2.5 hover:border-blue-200 hover:shadow-[0_14px_36px_rgba(23,57,116,0.08)]">
      <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-lg">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={700}
          height={438}
          loading="eager"
          className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.025]"
        />
      </Link>
      <div className={compact ? "p-2" : "p-2 sm:p-3"}>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-xs font-bold text-[#0b1b46] hover:text-brand sm:text-base"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span>{variant.label}</span>
          <span>•</span>
          <span>พร้อมส่งทันที</span>
        </div>
        <div className="mt-3 flex flex-col justify-between gap-2 xl:flex-row xl:items-center">
          <span className="text-sm font-black text-brand sm:text-lg">{formatTHB(variant.price)}</span>
          <AddToCartButton variantSlug={variant.slug} />
        </div>
      </div>
    </article>
  );
}
