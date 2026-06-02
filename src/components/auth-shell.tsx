import Image from "next/image";
import { Logo } from "@/components/ui/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[.92fr_1.08fr]">
      <section className="hidden border-r border-line bg-[#fbfcff] px-10 py-8 lg:block">
        <Logo />
        <div className="relative mx-auto mt-20 h-[490px] max-w-[600px]">
          <Image
            src="/products/netflix-gift-code.png"
            alt=""
            width={520}
            height={325}
            loading="eager"
            className="voucher-shadow absolute left-0 top-4 w-[68%] -rotate-6 rounded-xl"
          />
          <Image
            src="/products/youtube-premium.png"
            alt=""
            width={520}
            height={325}
            loading="eager"
            className="voucher-shadow absolute right-0 top-28 w-[68%] rotate-3 rounded-xl"
          />
          <Image
            src="/products/spotify-gift-card.png"
            alt=""
            width={520}
            height={325}
            loading="eager"
            className="voucher-shadow absolute left-[10%] top-56 w-[68%] -rotate-3 rounded-xl"
          />
        </div>
        <h2 className="mx-auto mt-8 max-w-[560px] text-4xl font-black tracking-[-0.05em]">
          <span className="text-brand">Voucher</span> พรีเมียม
          <br />
          พร้อมใช้ในไม่กี่นาที
        </h2>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        {children}
      </section>
    </main>
  );
}
