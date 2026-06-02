import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="PrimePass">
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-lg font-black text-white">
        P
      </span>
      {!compact && (
        <span className="text-[22px] font-black tracking-[-0.04em] text-[#07163d]">
          PrimePass
        </span>
      )}
    </Link>
  );
}
