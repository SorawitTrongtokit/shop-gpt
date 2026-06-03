import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import {
  formatStockLabel,
  formatTHB,
  hasSellableStock,
  type CatalogProduct,
} from "@/lib/catalog";

export function ProductCard({
  product,
  compact = false,
}: {
  product: CatalogProduct;
  compact?: boolean;
}) {
  const variant =
    product.variants.find((item) => hasSellableStock(item)) ?? product.variants[0];
  const inStock = variant ? hasSellableStock(variant) : false;
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
        {variant ? (
          <>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted">
              <span>{variant.label}</span>
              <span>•</span>
              <span className={inStock ? "text-[#158257]" : "font-bold text-red-600"}>
                {formatStockLabel(variant)}
              </span>
            </div>
            <div className="mt-3 flex flex-col justify-between gap-2 xl:flex-row xl:items-center">
              <span className="text-sm font-black text-brand sm:text-lg">
                {formatTHB(variant.price)}
              </span>
              <AddToCartButton
                variantSlug={variant.slug}
                availableStock={variant.stock}
              />
            </div>
          </>
        ) : (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
            สินค้าหมด
          </div>
        )}
      </div>
    </article>
  );
}
