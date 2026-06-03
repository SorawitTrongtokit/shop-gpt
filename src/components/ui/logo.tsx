"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2" aria-label="PrimePass">
      <motion.span
        whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        whileTap={{ scale: 0.9 }}
        className="flex size-9 items-center justify-center rounded-xl bg-brand text-lg font-black text-white shadow-sm"
      >
        P
      </motion.span>
      {!compact && (
        <span className="text-[22px] font-black tracking-[-0.04em] text-[#07163d]">
          PrimePass
        </span>
      )}
    </Link>
  );
}
